import express from 'express'
import {Kato, ExpressAdapter} from "../index";

(async () => {
  //新建一个应用程序
  const app = express();
  //新建一个kato实例
  const kato = new Kato();

  //通过express适配器,把kato实例挂载到应用程序中
  app.use('/api', ExpressAdapter(kato));
  app.on('error', err => console.log('express error:', err.message));
  app.listen(3000, () => console.log('listening on 3000...'));

})().catch(err => console.error("主函数错误:", err));
