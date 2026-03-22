import app from './src/app';
import config from './src/config/env';

app.listen(config.port, () => {
  console.log(`[truth-serum] running on http://localhost:${config.port}`);
});
