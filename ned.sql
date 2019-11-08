-- Server version: 10.3.19-MariaDB
-- PHP Version: 7.3.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ned`
--

-- --------------------------------------------------------

--
-- Table structure for table `actividades`
--

CREATE TABLE `actividades` (
  `ID` varchar(20) NOT NULL,
  `centro` varchar(20) DEFAULT NULL COMMENT 'ID del centro seleccionado',
  `lugar` varchar(200) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `disciplina` varchar(20) DEFAULT NULL COMMENT 'ID de la disciplina seleccionada (alto rendimiento)',
  `descripcion` text DEFAULT NULL,
  `tipo` tinyint(1) NOT NULL DEFAULT 0 COMMENT '0: alto rendimiento; 1: nutricion; 2: actividad física'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `actividades_alumnos`
--

CREATE TABLE `actividades_alumnos` (
  `ID` varchar(20) NOT NULL COMMENT 'ID del alumno',
  `actividades` text DEFAULT NULL COMMENT 'lista de IDs delimitada por comas',
  `eventos` text DEFAULT NULL COMMENT 'lista de IDs delimitada por comas'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `actividades_horarios`
--

CREATE TABLE `actividades_horarios` (
  `ID` varchar(20) NOT NULL,
  `actividad` varchar(20) NOT NULL COMMENT 'ID de la actividad asociada',
  `dias` varchar(20) DEFAULT NULL COMMENT 'array de días en valor numérico (0 - 6)',
  `de_hora` varchar(10) NOT NULL DEFAULT '0;0',
  `hasta_hora` varchar(10) NOT NULL DEFAULT '0;0',
  `edad_min` int(2) NOT NULL DEFAULT 0,
  `edad_max` int(2) NOT NULL DEFAULT 0,
  `sexo` tinyint(1) NOT NULL DEFAULT 2 COMMENT '0: masculino; 1: femenino; 2: ambos'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `centros`
--

CREATE TABLE `centros` (
  `ID` varchar(20) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `domicilio` varchar(100) NOT NULL,
  `ciudad` varchar(50) NOT NULL,
  `estado` varchar(20) NOT NULL,
  `cp` varchar(20) NOT NULL,
  `pais` varchar(15) NOT NULL,
  `latitud` double DEFAULT NULL,
  `longitud` double DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `centros_horarios`
--

CREATE TABLE `centros_horarios` (
  `ID` varchar(20) NOT NULL,
  `centro` varchar(20) NOT NULL,
  `tipo` int(11) NOT NULL COMMENT '0: instalacion; 1 informes',
  `de_dia` int(1) NOT NULL DEFAULT 0,
  `hasta_dia` int(1) NOT NULL DEFAULT 0,
  `de_hora` varchar(10) NOT NULL DEFAULT '0;0',
  `hasta_hora` varchar(10) NOT NULL DEFAULT '0;0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `centros_telefonos`
--

CREATE TABLE `centros_telefonos` (
  `ID` varchar(20) NOT NULL,
  `centro` varchar(20) NOT NULL,
  `num` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `centros_usuarios`
--

CREATE TABLE `centros_usuarios` (
  `ID` varchar(20) NOT NULL,
  `centro` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `detalles`
--

CREATE TABLE `detalles` (
  `ID` varchar(20) NOT NULL,
  `referente` varchar(20) NOT NULL COMMENT 'ID de la activad, costo u otro item asociado',
  `concepto` varchar(60) NOT NULL COMMENT 'descripción breve',
  `valor` double DEFAULT 0 COMMENT 'precio opcional',
  `tipo` tinyint(1) NOT NULL DEFAULT 0 COMMENT '0: costo; 1: requisito; 2: otro'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='costos y/o requisitos de actividades y eventos';

-- --------------------------------------------------------

--
-- Table structure for table `disciplinas`
--

CREATE TABLE `disciplinas` (
  `ID` varchar(20) NOT NULL,
  `nombre` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `disciplinas`
--

INSERT INTO `disciplinas` (`ID`, `nombre`) VALUES
('0WfRKLiTxZG', 'Softbol'),
('0znkJIkRLpM', 'Triatlón'),
('107O2H5yJUZ', 'Frontón'),
('2BnducQE1QY', 'Judo'),
('2S-Afb4kI4E', 'Vela'),
('4c_e14jAw4r', 'Nado sincronizado'),
('59XQmiR9_tE', 'Tenis de mesa'),
('5b7f-J0Bno2', 'Bádminton'),
('65xd89TxXRO', 'Gimnasia artística varonil'),
('7dVmfdokT5', 'Clavados'),
('7EjX51yNbue', 'Gimnasia rítmica'),
('7yaji2zTVu4', 'Pentatlón moderno'),
('84r_I5sRgO', 'Ciclismo'),
('9DQsiOG58pz', 'Rugby'),
('ezyfgltQ3Mt', 'Ajedrez'),
('ffmzQ9Tyoo', 'Natación'),
('gzbsw9AoEVc', 'Patines sobre ruedas'),
('hVEchZZl-k', 'Boxeo'),
('HvkqCYykvw', 'Esgrima'),
('hzqmZEGG7Ax', 'Canotaje'),
('IEocQNvJQEH', 'Remo'),
('ii7GPW3sbeq', 'Fútbol'),
('ijR5t9XBu0h', 'Polo actuático'),
('KHRK8yTQMi', 'Tiro con arco'),
('KVxijMa8oM8', 'Basquetbol'),
('lpy7vxpQ4r', 'Atletismo'),
('MJ24q9QtM79', 'Voleibol de playa'),
('Mr12R7JqDB6', 'Gimnasia artística femenil'),
('MWO_7r4knd', 'Raquetbol'),
('nm5cR0ae2V7', 'Tiro deportivo'),
('OMiN5uywOCP', 'Gimnasia trampolín'),
('rGp4eYTpxzM', 'Karate Do'),
('rGu66uJTagL', 'Luchas'),
('RJnmlHdF8l3', 'Tenis'),
('rKcqqiSSLsy', 'Squash'),
('RVi9ESqvuY', 'Levantamiento de pesas'),
('SD42rFvl2_l', 'Handball'),
('TAC4Ow_fuLX', 'Boliche'),
('tKcml0L58_v', 'Beisbol'),
('UHsFdPJypgQ', 'Taekwondo'),
('uO4PhRlWo1V', 'Charrería'),
('WI9930m0Vr4', 'Aguas abiertas'),
('Ye9evUvmJxI', 'Voleibol'),
('_5r2gQGa2KT', 'Hockey sobre pasto');

-- --------------------------------------------------------

--
-- Table structure for table `evaluaciones_rankings`
--

CREATE TABLE `evaluaciones_rankings` (
  `ID` varchar(40) NOT NULL,
  `centro` varchar(20) NOT NULL,
  `evaluador` varchar(20) NOT NULL,
  `ranking` tinyint(1) NOT NULL DEFAULT 1,
  `fecha` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `eventos`
--

CREATE TABLE `eventos` (
  `ID` varchar(20) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `fecha` bigint(20) NOT NULL,
  `hora` varchar(10) NOT NULL,
  `centro` varchar(20) DEFAULT NULL,
  `lugar` varchar(200) DEFAULT NULL,
  `tipo` tinyint(1) NOT NULL DEFAULT 0,
  `descripcion` text DEFAULT NULL,
  `disciplina` varchar(20) DEFAULT NULL,
  `nombreDisciplina` varchar(30) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `eventos_enlaces`
--

CREATE TABLE `eventos_enlaces` (
  `ID` varchar(20) NOT NULL,
  `titulo` varchar(80) NOT NULL,
  `url` varchar(200) NOT NULL,
  `evento` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `mediciones_alumnos`
--

CREATE TABLE `mediciones_alumnos` (
  `ID` varchar(40) NOT NULL,
  `alumno` varchar(20) NOT NULL,
  `edad_actual` int(3) NOT NULL,
  `evaluador` varchar(20) NOT NULL,
  `evaluador_nombre` varchar(60) DEFAULT NULL,
  `fecha` bigint(20) NOT NULL,
  `centro` varchar(20) NOT NULL,
  `peso` double NOT NULL COMMENT 'kg',
  `estatura` double NOT NULL COMMENT 'm',
  `cintura` double NOT NULL COMMENT 'cm',
  `cadera` double NOT NULL COMMENT 'cm',
  `pantorrilla` double NOT NULL COMMENT 'circunferencias. cm',
  `brazoRelajado` double NOT NULL COMMENT 'circunferencias. cm',
  `brazoFlexionado` double NOT NULL COMMENT 'circunferencias. cm',
  `tricipital` double NOT NULL COMMENT 'pliegues. mm',
  `subescapular` double NOT NULL COMMENT 'pliegues. mm',
  `supraespinal` double NOT NULL COMMENT 'pliegues. mm',
  `abdominal` double NOT NULL COMMENT 'pliegues. mm',
  `musloFrontal` double NOT NULL COMMENT 'pliegues. mm',
  `pantorrillaMedial` double NOT NULL COMMENT 'pliegues. mm',
  `sistole` double NOT NULL COMMENT 'presión',
  `diastole` double NOT NULL COMMENT 'presión',
  `pulso` double NOT NULL COMMENT 'ppm',
  `biestiloideo` double NOT NULL COMMENT 'diámetros. mm',
  `biepicondileo` double NOT NULL COMMENT 'diámetros. mm'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `perfiles`
--

CREATE TABLE `perfiles` (
  `ID` varchar(20) NOT NULL,
  `nombres` varchar(50) NOT NULL,
  `apellidos` varchar(50) NOT NULL,
  `sexo` tinyint(1) DEFAULT 0 COMMENT '0: male; 1: female',
  `nacimiento` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `perfiles`
--

INSERT INTO `perfiles` (`ID`, `nombres`, `apellidos`, `sexo`, `nacimiento`) VALUES
('-pVF__P2m', 'Coordinador', 'Base', 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `pruebas_alumnos`
--

CREATE TABLE `pruebas_alumnos` (
  `ID` varchar(40) NOT NULL,
  `alumno` varchar(20) NOT NULL,
  `edad_actual` int(3) NOT NULL,
  `evaluador` varchar(20) NOT NULL,
  `evaluador_nombre` varchar(60) DEFAULT NULL,
  `fecha` bigint(20) NOT NULL,
  `centro` varchar(20) NOT NULL,
  `equilibrio` double NOT NULL COMMENT 'segundos',
  `coordinacion` double NOT NULL COMMENT 'minutos',
  `flexibilidad` double NOT NULL COMMENT 'cm',
  `brazos` double NOT NULL COMMENT 'fuerza. repeticiones',
  `piernas` double NOT NULL COMMENT 'fuerza. repeticiones',
  `abdomen` double NOT NULL COMMENT 'fuerza. repeticiones',
  `resistencia` double NOT NULL COMMENT 'cooper. km'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `pruebas_referencias`
--

CREATE TABLE `pruebas_referencias` (
  `ID` int(1) NOT NULL,
  `evaluacion` varchar(20) NOT NULL,
  `grupo` varchar(30) NOT NULL,
  `unidad` varchar(20) NOT NULL,
  `bajo` double NOT NULL,
  `normal` double NOT NULL,
  `alto` double NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='No modificar estructura de esta tabla';

--
-- Dumping data for table `pruebas_referencias`
--

INSERT INTO `pruebas_referencias` (`ID`, `evaluacion`, `grupo`, `unidad`, `bajo`, `normal`, `alto`) VALUES
(0, 'Equilibrio', 'Equilibrio y coordinación', 'segundos', 0, 6, 21),
(1, 'Coordinación', 'Equilibrio y coordinación', 'minutos', 1, 4, 7),
(2, 'Flexibilidad', 'Flexibilidad', 'cm', -3, 0, 1),
(3, 'Brazos', 'Fuerza', 'repeticiones', 1, 7, 13),
(4, 'Piernas', 'Fuerza', 'repeticiones', 1, 10, 20),
(5, 'Abdomen', 'Fuerza', 'repeticiones', 1, 11, 20),
(6, 'Cooper', 'Resistencia', 'km', 1, 1.4, 1.9);

-- --------------------------------------------------------

--
-- Table structure for table `recomendaciones`
--

CREATE TABLE `recomendaciones` (
  `ID` bigint(20) UNSIGNED NOT NULL,
  `envia` varchar(20) NOT NULL,
  `recibe` varchar(20) NOT NULL,
  `fecha` bigint(20) NOT NULL,
  `texto` text NOT NULL,
  `titulo` text NOT NULL,
  `tipo` tinyint(4) NOT NULL DEFAULT 0 COMMENT '0: alumno; 1: actividad'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `ID` varchar(20) NOT NULL,
  `rol` tinyint(1) NOT NULL DEFAULT 0 COMMENT '1:coordinador master; 2: entrenador; 3: nutriólogo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`ID`, `rol`) VALUES
('-pVF__P2m', 1);

-- --------------------------------------------------------

--
-- Table structure for table `usuarios`
--

CREATE TABLE `usuarios` (
  `ID` varchar(20) NOT NULL,
  `usuario` varchar(30) NOT NULL COMMENT 'nombre de usuario',
  `registro` bigint(20) DEFAULT NULL COMMENT 'fecha en la que se dio de alta en el sistema',
  `email` varchar(100) DEFAULT NULL,
  `telefono` varchar(30) DEFAULT NULL,
  `tipo` tinyint(1) NOT NULL DEFAULT 0 COMMENT '0 visitante, 1 coordinador, 2 evaluador, 3 alumno',
  `contrasena` varchar(40) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'la cuenta está (1) activa, (0) inactiva',
  `validada` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'la cuenta se valida al iniciar sesión por primera vez (alumnos y evaluadores)',
  `registrante` varchar(20) DEFAULT NULL COMMENT 'ID del usuario que registró a este usuario'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `usuarios`
--

INSERT INTO `usuarios` (`ID`, `usuario`, `registro`, `email`, `telefono`, `tipo`, `contrasena`, `activo`, `validada`, `registrante`) VALUES
('-pVF__P2m', 'COORD0', 1570070249000, 'test@email.com', '', 1, '202cb962ac59075b964b07152d234b70', 1, 1, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `actividades`
--
ALTER TABLE `actividades`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `actividades_alumnos`
--
ALTER TABLE `actividades_alumnos`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `actividades_horarios`
--
ALTER TABLE `actividades_horarios`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `centros`
--
ALTER TABLE `centros`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `centros_horarios`
--
ALTER TABLE `centros_horarios`
  ADD PRIMARY KEY (`ID`),
  ADD UNIQUE KEY `ID` (`ID`);

--
-- Indexes for table `centros_telefonos`
--
ALTER TABLE `centros_telefonos`
  ADD PRIMARY KEY (`ID`),
  ADD UNIQUE KEY `ID` (`ID`);

--
-- Indexes for table `centros_usuarios`
--
ALTER TABLE `centros_usuarios`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `detalles`
--
ALTER TABLE `detalles`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `disciplinas`
--
ALTER TABLE `disciplinas`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `evaluaciones_rankings`
--
ALTER TABLE `evaluaciones_rankings`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `eventos`
--
ALTER TABLE `eventos`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `eventos_enlaces`
--
ALTER TABLE `eventos_enlaces`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `mediciones_alumnos`
--
ALTER TABLE `mediciones_alumnos`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `perfiles`
--
ALTER TABLE `perfiles`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `pruebas_alumnos`
--
ALTER TABLE `pruebas_alumnos`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `pruebas_referencias`
--
ALTER TABLE `pruebas_referencias`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `recomendaciones`
--
ALTER TABLE `recomendaciones`
  ADD PRIMARY KEY (`ID`),
  ADD UNIQUE KEY `ID` (`ID`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`ID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `recomendaciones`
--
ALTER TABLE `recomendaciones`
  MODIFY `ID` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
