import app from './app.js';
import {env} from './config/env.js'
import { startMarketSimulator } from "./modules/market/simulator.js";

startMarketSimulator();
const start = async () => {
    try {
        await app.listen({
            port: env.PORT,
            host: "0.0.0.0"
        });
        console.log(`Server running on port ${env.PORT}`);
    } catch (err) {
        app.log.error(err, "error while starting app");
        process.exit(1);
    }
}

start();