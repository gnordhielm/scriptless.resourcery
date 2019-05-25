// const minify = require('html-minifier').minify
const Minimize = require('minimize');

module.exports = config => {
  const { title, styles, scripts } = config;
  const result = `
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="utf-8" />
                <meta 
                    name="viewport" 
                    content="width=device-width, initial-scale=1"
                />
                <title>${title}</title>
                <style>${styles}</style>
                </head>
                <body>
                <div id="mount-node"></div>
                <script type="text/javascript">${scripts}</script>
            </body>
        </html>
    `;
  return new Minimize().parse(result);
};
