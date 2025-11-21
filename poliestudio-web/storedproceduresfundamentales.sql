
IF OBJECT_ID('sp_CrearCuenta') IS NOT NULL
    DROP PROCEDURE sp_CrearCuenta;
GO

CREATE PROCEDURE sp_CrearCuenta
    @usuario NVARCHAR(50),
    @contrasena NVARCHAR(50),
    @estado NVARCHAR(50) = 'Activo',
    @id_cuenta INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1 FROM Cuenta WHERE usuario = @usuario)
    BEGIN
        RAISERROR('El nombre de usuario ya existe.', 16, 1);
        RETURN;
    END;
    INSERT INTO Cuenta (usuario, contrasena, estado, fecha_creacion)
    VALUES (@usuario, @contrasena, @estado, GETDATE());
    SET @id_cuenta = SCOPE_IDENTITY();
END;
GO

IF OBJECT_ID('sp_CrearRepresentante') IS NOT NULL
    DROP PROCEDURE sp_CrearRepresentante;
GO

CREATE PROCEDURE sp_CrearRepresentante
    @id_representante INT,
    @nombre NVARCHAR(50),
    @apellido NVARCHAR(50),
    @usuario NVARCHAR(50),
    @contrasena NVARCHAR(50),
    @estado NVARCHAR(50) = 'Activo'
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1 FROM Representante WHERE id_representante = @id_representante)
    BEGIN
        RAISERROR('El representante ya existe.', 16, 1);
        RETURN;
    END;

    DECLARE @id_cuenta INT;

    EXEC sp_CrearCuenta 
        @usuario = @usuario,
        @contrasena = @contrasena,
        @estado = @estado,
        @id_cuenta = @id_cuenta OUTPUT;
    INSERT INTO Representante (id_representante, nombre, apellido, id_cuenta)
    VALUES (@id_representante, @nombre, @apellido, @id_cuenta);
END;
GO


IF OBJECT_ID('sp_CrearProfesor') IS NOT NULL
    DROP PROCEDURE sp_CrearProfesor;
GO

CREATE PROCEDURE sp_CrearProfesor
    @id_profesor INT,
    @nombres NVARCHAR(50),
    @apellidos NVARCHAR(50),
    @usuario NVARCHAR(50),
    @contrasena NVARCHAR(50),
    @estado NVARCHAR(50) = 'Activo'
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @id_cuenta INT;

    -- Crear cuenta primero
    EXEC sp_CrearCuenta 
        @usuario = @usuario,
        @contrasena = @contrasena,
        @estado = @estado,
        @id_cuenta = @id_cuenta OUTPUT;

    -- Insertar profesor
    INSERT INTO Profesor (id_profesor, nombres, apellidos, id_cuenta)
    VALUES (@id_profesor, @nombres, @apellidos, @id_cuenta);
END;
GO


IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_CrearEstudiante')
    DROP PROCEDURE sp_CrearEstudiante;
GO

CREATE PROCEDURE sp_CrearEstudiante
    @id_estudiante INT,               -- << PK que t� usas (c�dula)
    @nombres NVARCHAR(50),
    @apellidos NVARCHAR(50),
    @usuario NVARCHAR(50),
    @contrasena NVARCHAR(50),
    @id_representante INT = NULL,
    @estado NVARCHAR(50) = 'Activo'
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @id_cuenta INT;

    EXEC sp_CrearCuenta 
        @usuario = @usuario,
        @contrasena = @contrasena,
        @estado = @estado,
        @id_cuenta = @id_cuenta OUTPUT;

    INSERT INTO Estudiante (id_estudiante, nombres, apellidos, id_cuenta, id_representante)
    VALUES (@id_estudiante, @nombres, @apellidos, @id_cuenta, @id_representante);

END;
GO


IF OBJECT_ID('sp_CrearParalelo') IS NOT NULL
    DROP PROCEDURE sp_CrearParalelo;
GO

CREATE PROCEDURE sp_CrearParalelo
    @aula NVARCHAR(50),
    @edificio NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1 FROM Paralelo WHERE aula = @aula)
    BEGIN
        RAISERROR('Ya existe un paralelo con el mismo curso y aula.', 16, 1);
        RETURN;
    END;
    INSERT INTO Paralelo (aula, edificio)
    VALUES (@aula, @edificio);
END;
GO

IF OBJECT_ID('sp_CrearAsignatura') IS NOT NULL
    DROP PROCEDURE sp_CrearAsignatura;
GO

CREATE PROCEDURE sp_CrearAsignatura
    @nombre NVARCHAR(50),
    @descripcion NVARCHAR(50),
    @id_profesor INT
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM Profesor WHERE id_profesor = @id_profesor)
    BEGIN
        RAISERROR('El profesor especificado no existe.', 16, 1);
        RETURN;
    END;

    IF EXISTS (SELECT 1 FROM Asignatura WHERE nombre = @nombre AND id_profesor = @id_profesor)
    BEGIN
        RAISERROR('El profesor ya tiene registrada una asignatura con ese nombre.', 16, 1);
        RETURN;
    END;

    INSERT INTO Asignatura (nombre, descripcion, id_profesor)
    VALUES (@nombre, @descripcion, @id_profesor);
END;
GO


IF OBJECT_ID('sp_AsignarHorario') IS NOT NULL
    DROP PROCEDURE sp_AsignarHorario;
GO

CREATE PROCEDURE sp_AsignarHorario
    @dia NVARCHAR(50),
    @hora_inicio TIME,
    @hora_fin TIME,
    @id_asignatura INT,
    @id_paralelo INT
AS
BEGIN
    SET NOCOUNT ON;

    IF @hora_inicio >= @hora_fin
    BEGIN
        RAISERROR('La hora de inicio debe ser menor a la hora fin.', 16, 1);
        RETURN;
    END;

    INSERT INTO Horario (dia, hora_inicio, hora_fin, id_asignatura, id_paralelo)
    VALUES (@dia, @hora_inicio, @hora_fin, @id_asignatura, @id_paralelo);
END;
GO




IF OBJECT_ID('sp_ModificarPonderacion') IS NOT NULL
    DROP PROCEDURE sp_ModificarPonderacion;
GO
CREATE PROCEDURE sp_ModificarPonderacion
    @id_calificacion INT,
    @nueva_ponderacion DECIMAL(5,2)
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM Calificacion WHERE id_calificacion = @id_calificacion)
    BEGIN
        RAISERROR('La calificaci�n especificada no existe.', 16, 1);
        RETURN;
    END;
    IF @nueva_ponderacion < 0 OR @nueva_ponderacion > 1
    BEGIN
        RAISERROR('La ponderaci�n debe estar entre 0 y 1.', 16, 1);
        RETURN;
    END;
    UPDATE Calificacion
    SET ponderacion = @nueva_ponderacion
    WHERE id_calificacion = @id_calificacion;

    PRINT 'Ponderaci�n actualizada correctamente.';
END;
GO

IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_DesactivarCuenta')
    DROP PROCEDURE sp_DesactivarCuenta;
GO

CREATE PROCEDURE sp_DesactivarCuenta
    @id_cuenta INT
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM Cuenta WHERE id_cuenta = @id_cuenta)
    BEGIN
        RAISERROR('La cuenta especificada no existe.', 16, 1);
        RETURN;
    END;

    IF EXISTS (SELECT 1 FROM Cuenta WHERE id_cuenta = @id_cuenta AND estado = 'Inactivo')
    BEGIN
        RAISERROR('La cuenta ya est� inactiva.', 16, 1);
        RETURN;
    END;

    UPDATE Cuenta
    SET estado = 'Inactivo'
    WHERE id_cuenta = @id_cuenta;

    PRINT 'La cuenta ha sido desactivada correctamente.';
END;
GO


IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_EditarEstudiante')
    DROP PROCEDURE sp_EditarEstudiante;
GO

CREATE PROCEDURE sp_EditarEstudiante
    @id_estudiante INT,
    @nombres NVARCHAR(50),
    @apellidos NVARCHAR(50),
    @id_representante INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM Estudiante WHERE id_estudiante = @id_estudiante)
    BEGIN
        RAISERROR('El estudiante especificado no existe.', 16, 1);
        RETURN;
    END;

    IF @id_representante IS NOT NULL 
       AND NOT EXISTS (SELECT 1 FROM Representante WHERE id_representante = @id_representante)
    BEGIN
        RAISERROR('El representante especificado no existe.', 16, 1);
        RETURN;
    END;

    UPDATE Estudiante
    SET nombres = @nombres,
        apellidos = @apellidos,
        id_representante = @id_representante
    WHERE id_estudiante = @id_estudiante;

    PRINT 'Datos del estudiante actualizados correctamente.';
END;
GO

IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_EditarProfesor')
    DROP PROCEDURE sp_EditarProfesor;
GO

CREATE PROCEDURE sp_EditarProfesor
    @id_profesor INT,
    @nombres NVARCHAR(50),
    @apellidos NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM Profesor WHERE id_profesor = @id_profesor)
    BEGIN
        RAISERROR('El profesor especificado no existe.', 16, 1);
        RETURN;
    END;
    UPDATE Profesor
    SET nombres = @nombres,
        apellidos = @apellidos
    WHERE id_profesor = @id_profesor;

    PRINT 'Datos del profesor actualizados correctamente.';
END;
GO

IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_EditarRepresentante')
    DROP PROCEDURE sp_EditarRepresentante;
GO

CREATE PROCEDURE sp_EditarRepresentante
    @id_representante INT,
    @nombre NVARCHAR(50),
    @apellido NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM Representante WHERE id_representante = @id_representante)
    BEGIN
        RAISERROR('El representante especificado no existe.', 16, 1);
        RETURN;
    END;
    UPDATE Representante
    SET nombre = @nombre,
        apellido = @apellido
    WHERE id_representante = @id_representante;

    PRINT 'Datos del representante actualizados correctamente.';
END;
GO

IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_RegistrarCalificacion')
    DROP PROCEDURE sp_RegistrarCalificacion;
GO

CREATE PROCEDURE sp_RegistrarCalificacion
    @nombre_actividad NVARCHAR(50),
    @ponderacion INT,
    @valor_calificacion DECIMAL(4,2),
    @id_estudiante INT,
    @id_asignatura INT,
    @rango_calificacion INT = 10   
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM Estudiante WHERE id_estudiante = @id_estudiante)
    BEGIN
        RAISERROR('El estudiante especificado no existe.', 16, 1);
        RETURN;
    END;
    IF NOT EXISTS (SELECT 1 FROM Asignatura WHERE id_asignatura = @id_asignatura)
    BEGIN
        RAISERROR('La asignatura especificada no existe.', 16, 1);
        RETURN;
    END;
    IF @ponderacion < 0 OR @ponderacion > 100
    BEGIN
        RAISERROR('La ponderaci�n debe estar entre 0 y 100.', 16, 1);
        RETURN;
    END;
    IF @rango_calificacion <= 0
    BEGIN
        RAISERROR('El rango de calificaci�n debe ser mayor que 0.', 16, 1);
        RETURN;
    END;
    IF @valor_calificacion < 0 OR @valor_calificacion > @rango_calificacion
    BEGIN
        DECLARE @mensaje NVARCHAR(100) = CONCAT('El valor de la calificaci�n debe estar entre 0 y ', @rango_calificacion, '.');
        RAISERROR(@mensaje, 16, 1);
        RETURN;
    END;
    INSERT INTO Calificacion (nombre_actividad, ponderacion, valor_calificacion, id_estudiante, id_asignatura, rango_calificacion)
    VALUES (@nombre_actividad, @ponderacion, @valor_calificacion, @id_estudiante, @id_asignatura, @rango_calificacion);

    PRINT 'Calificaci�n registrada correctamente.';
END;
GO

IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_CrearSesion')
    DROP PROCEDURE sp_CrearSesion;
GO

CREATE PROCEDURE sp_CrearSesion
    @id_profesor INT,
    @id_asignatura INT,
    @id_curso INT,
    @id_sesion INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM Profesor WHERE id_profesor = @id_profesor)
    BEGIN
        RAISERROR('El profesor especificado no existe.', 16, 1);
        RETURN;
    END;
    IF NOT EXISTS (SELECT 1 FROM Asignatura WHERE id_asignatura = @id_asignatura)
    BEGIN
        RAISERROR('La asignatura especificada no existe.', 16, 1);
        RETURN;
    END;
    IF NOT EXISTS (SELECT 1 FROM Paralelo WHERE id_paralelo = @id_curso)
    BEGIN
        RAISERROR('El curso especificado no existe.', 16, 1);
        RETURN;
    END;
    INSERT INTO Sesion (id_profesor, id_asignatura, id_curso)
    VALUES (@id_profesor, @id_asignatura, @id_curso);

    SET @id_sesion = SCOPE_IDENTITY();

    PRINT 'Sesi�n creada correctamente.';
END;
GO
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_RegistrarAsistencia')
    DROP PROCEDURE sp_RegistrarAsistencia;
GO

CREATE PROCEDURE sp_RegistrarAsistencia
    @id_estudiante INT,
    @id_sesion INT,
    @estado_asistencia NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM Estudiante WHERE id_estudiante = @id_estudiante)
    BEGIN
        RAISERROR('El estudiante especificado no existe.', 16, 1);
        RETURN;
    END;
    IF NOT EXISTS (SELECT 1 FROM Sesion WHERE id_sesion = @id_sesion)
    BEGIN
        RAISERROR('La sesi�n especificada no existe.', 16, 1);
        RETURN;
    END;
    IF @estado_asistencia NOT IN ('Presente', 'Ausente', 'Justificado', 'Atraso')
    BEGIN
        RAISERROR('El estado de asistencia debe ser: Presente, Ausente , Justificado o Atraso.', 16, 1);
        RETURN;
    END;
    DECLARE @id_asistencia INT;

    INSERT INTO Asistencia (estado_asistencia, id_estudiante)
    VALUES (@estado_asistencia, @id_estudiante);

    SET @id_asistencia = SCOPE_IDENTITY();
    UPDATE Sesion
    SET id_asistencia = @id_asistencia
    WHERE id_sesion = @id_sesion;

    PRINT 'Asistencia registrada correctamente.';
END;
GO

IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_CrearSesionYRegistrarAsistencia')
    DROP PROCEDURE sp_CrearSesionYRegistrarAsistencia;
GO

CREATE PROCEDURE sp_CrearSesionYRegistrarAsistencia
    @id_profesor INT,
    @id_asignatura INT,
    @id_curso INT,
    @lista_estudiantes NVARCHAR(MAX)  
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @id_sesion INT;

    BEGIN TRY
        BEGIN TRAN;
        EXEC sp_CrearSesion 
            @id_profesor = @id_profesor,
            @id_asignatura = @id_asignatura,
            @id_curso = @id_curso,
            @id_sesion = @id_sesion OUTPUT;

        DECLARE @id_estudiante INT;
        DECLARE @pos INT = 1;
        DECLARE @csv NVARCHAR(MAX) = @lista_estudiantes + ','; -- agregar coma final
        DECLARE @next NVARCHAR(10);

        WHILE CHARINDEX(',', @csv, @pos) > 0
        BEGIN
            SET @next = SUBSTRING(@csv, @pos, CHARINDEX(',', @csv, @pos) - @pos);
            SET @id_estudiante = CAST(@next AS INT);

            EXEC sp_RegistrarAsistencia
                @id_estudiante = @id_estudiante,
                @id_sesion = @id_sesion,
                @estado_asistencia = 'Ausente';

            SET @pos = CHARINDEX(',', @csv, @pos) + 1;
        END;

        COMMIT TRAN;
        PRINT 'Sesi�n y asistencias registradas correctamente.';
    END TRY
    BEGIN CATCH
        ROLLBACK TRAN;
        RAISERROR('Error al registrar la sesi�n o asistencias.', 16, 1);
    END CATCH;
END;
GO

IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_ConsultarCalificacionesEstudiante')
    DROP PROCEDURE sp_ConsultarCalificacionesEstudiante;
GO

CREATE PROCEDURE sp_ConsultarCalificacionesEstudiante
    @id_estudiante INT
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM Estudiante WHERE id_estudiante = @id_estudiante)
    BEGIN
        RAISERROR('El estudiante especificado no existe.', 16, 1);
        RETURN;
    END;

    SELECT 
        a.nombre AS NombreAsignatura,
        c.nombre_actividad AS Actividad,
        c.valor_calificacion AS Calificacion,
        c.ponderacion AS Ponderacion,
        (c.valor_calificacion * (c.ponderacion / 100.0)) AS CalificacionPonderada
    FROM Calificacion c
    INNER JOIN Asignatura a ON c.id_asignatura = a.id_asignatura
    WHERE c.id_estudiante = @id_estudiante
    ORDER BY a.nombre, c.nombre_actividad;
END;
GO

