//requires all components in `src/components/**/index.js`
/*const directives = require.context('./src/components/', true, /directive\.js$/);
directives.keys().forEach(directives);*/

/*const controllers = require.context('./src/components/', true, /controller\.js$/);
controllers.keys().forEach(controllers);*/

//requires all modules in `src/modules/**/index.js`
/*const modules = require.context('./src/modules/', true, /index\.js$/);
modules.keys().forEach(modules);*/

//require all tests in src directory
const  context = require.context('./test', true, /\.spec\.js$/);
context.keys().forEach(context);