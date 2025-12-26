import app from './app';



const PORT = Number(process.env.PORT) || 4000;

const start = async () => {
    try {
        await app.listen({
            port: PORT
        }),
        console.log(`Server running on port ${PORT}`);
    } catch (err) {
        app.log.error(err, "error while starting app");
        process.exit(1);
    }
}

start();