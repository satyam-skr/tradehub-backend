import app from './app';
import {env} from './config/env'
import { startMarketSimulator } from "./modules/market/simulator";

startMarketSimulator();
const start = async () => {
    try {
        await app.listen({
            port: env.PORT
        });
        console.log(`Server running on port ${env.PORT}`);
    } catch (err) {
        app.log.error(err, "error while starting app");
        process.exit(1);
    }
}

start();