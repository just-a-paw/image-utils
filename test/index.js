const image = require('../src/index');

(async () => {
    // By default, sharp conducts operations at the working directory,
    // so utils converts it into the source code's directory instead.
    await image('./test.png').flip().toFile('./out/out.png');
    await image('https://paw.bot/assets/paw2c.png')
        .then(image => image.jpeg().toFile('./out/out.jpg'))
        .catch(e => console.log(e.errno));

    // Synchronous functionality
    await image('./test.png').flip().toFile('./out/sync.png');
    await image('./out/sync.png').flip().toFile('./out/out.png');
})();