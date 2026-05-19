import { env } from "./src/config/env";
import app from "./src/app";

app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`)
})