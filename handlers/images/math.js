const { randomUUID } = require('crypto');
const { Resvg } = require('@resvg/resvg-js');
var fs = require('fs');

const commands = {
    "math": {
        description: 'Renderizza una formula matematica in LaTeX',
        syntax: 'math <formula>',
        handler: async (client, message, args, nconf) => {
            if (args.length === 0) {
                message.reply("Devi specificare una formula in TeX!");
                return;
            }

            require("mathjax").init({
                loader: { load: ['input/tex', 'output/svg'] }
            }).then((MathJax) => {
                const svg = MathJax.tex2svg(args.join(' '), { display: true });
                let svgString = MathJax.startup.adaptor.outerHTML(svg);

                // remove the MathJax container
                svgString = svgString.replace(/<mjx-container class="MathJax" jax="SVG" display="true">/, '').replace(/<\/mjx-container>/, '');

                const svgFile = `/tmp/${randomUUID()}.svg`;
                const pngFile = `/tmp/${randomUUID()}.png`;
                fs.writeFileSync(svgFile, svgString);

                const opts = {
                    background: 'rgba(255, 255, 255, 1)', // always white
                    fitTo: { //scale svg to fit output png width
                        mode: 'width',
                        value: 2100, //magic value
                    },
                    font: {
                        // fontFiles: ['./RobotoMono-Italic.ttf'], // Load custom fonts.
                        loadSystemFonts: false, // It will be faster to disable loading system fonts.
                        // defaultFontFamily: 'Roboto Mono',
                    },
                    logLevel: 'error',
                }

                const svgBuffer = Buffer.from(svgString);
                const resvg = new Resvg(svgBuffer, opts)
                const pngData = resvg.render()
                const pngBuffer = pngData.asPng()

                fs.writeFileSync(pngFile, pngBuffer);

                const media = client.library.MessageMedia.fromFilePath(pngFile);
                message.reply(media);

                fs.unlinkSync(svgFile);
                fs.unlinkSync(pngFile);

            }).catch((err) => { message.reply("La formula non è valida!"); console.log(err) });
        }
    }
};

module.exports = {
    commands: commands
};