import sass from 'sass';
import camelCase from 'lodash.camelcase';

function constructSassString(variables) {
  const asVariables = variables
    .map((variable) => `$${variable.name}: ${variable.value};`)
    .join('\n');
  const asClasses = variables
    .map((variable) => `.${variable.name} { value: ${variable.value} }`)
    .join('\n');

  return `${asVariables}\n${asClasses}`;
}

export default function parseVariables(variables, opts = {}) {
  const result = sass
    .renderSync({
      file: 'variables.scss', // specify input file name
      data: constructSassString(variables),
      outputStyle: 'compressed',
    })
    .css.toString();

  console.log(result.replace(/}./g, '}\n.').split(/\n/));

  const parsedVariables = result
    .replace(/}./g, '}\n.')
    .split(/\n/)
    .filter((line) => line && line.length)
    .map((variable) => {
      const [, name, value] = /^\.([^{\s]+){value:(.+)}$/.exec(variable);
      const obj = {};

      if (opts.preserveVariableNames) {
        obj[name] = value;
        return obj;
      }

      obj[camelCase(name)] = value;
      return obj;
    });

  if (!parsedVariables.length) {
    return {};
  }

  return Object.assign.apply(this, parsedVariables);
}
