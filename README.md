# Scada-JS
Este prototipo tiene como objetivo desarrollar un sistema SCADA ligero, optimizado para una implementación eficiente y adaptable. 
Está diseñado para ofrecer soporte tanto a pantallas HMI como a las funcionalidades completas de un SCADA, integrando un servidor y una interfaz gráfica. 
Su enfoque minimalista garantiza un rendimiento ágil sin depender de herramientas que añadan complejidad o peso innecesario.

## Tecnologías Utilizadas
### Back-End
- Lenguaje principal: TypeScript
- Framework: Express
- Librerías:
    - JSmodbus: para la demostración de comunicación Modbus
    - Vitest: para pruebas unitarias
    - Sinon: para mocks y stubs en las pruebas
    - SuperTest: para pruebas de endpoints HTTP

### Front-End
- Lenguaje principal: TypeScript
- Framework/Librerías:
    - Electron: para crear aplicaciones de escritorio multiplataforma
    - Express: como servidor backend integrado
    - JSdom: para simulación y manipulación de DOM
    - Vitest: para pruebas unitarias
    - Sinon: para mocks y stubs en las pruebas

## Instalación
Clonar el proyecto:
```bash
git clone https://github.com/SaraMForte/scada_js.git
```
El proyecto está dividido en dos carpetas:
- SCADA_server → Contiene el backend del sistema.
```bash
cd SCADA_server
npm install

```
- SCADA_client → Contiene el frontend del sistema.
```bash
cd SCADA_client
npm install
```
Una vez instalados las partes del proyectos ambos se ejecutarán mediante 
```bash
npm start
```
### Simulación con ModbusTCP/IP
El sistema está configurado por defecto para conectarse a la red local localhost (127.0.0.1), utilizando el puerto 502 y el ID de unidad 1.
Para probar la comunicación Modbus, necesitarás:
  - Un simulador de Modbus TCP/IP, como ModbusPal, ModScan o Modbus Slave.

## Ejecutar pruebas
Para validar la funcionalidad del proyecto, puedes ejecutar las pruebas implementadas:
```bash
npm test
```
Esto incluye pruebas unitarias y de integración tanto para el backend como para el frontend.

## Contacto
Si tienes preguntas, sugerencias o encuentras algún problema, no dudes en contactarme.
