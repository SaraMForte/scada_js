module.exports = {
    files: [
      '**/?(*.)+(spec|test).ts?(x)' // Coincide con tus archivos de test
    ],
    extensions: [
      'ts', 'tsx' // Soporte para TypeScript
    ],
    require: [
      'ts-node/register' // Transpilar archivos TypeScript en ejecución
    ],
    environmentVariables: {
      NODE_ENV: 'test' // Similar a testEnvironment: 'node'
    },
}
