import { Module } from '@nestjs/common';

import { AppService } from './app.service';
import { AppController } from './app.controller';
import { UsersModule } from './users/users.module';
import { onError, ORPCModule } from '@orpc/nest';

@Module({
  imports: [
    ORPCModule.forRoot({
      interceptors: [
        onError((error) => {
          console.error(error);
        }),
      ],
      eventIteratorKeepAliveInterval: 5000, // 5 seconds
    }),
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
