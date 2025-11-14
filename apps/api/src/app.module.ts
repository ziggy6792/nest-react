import { Module } from "@nestjs/common";

import { AppService } from "./app.service";
import { AppController } from "./app.controller";
import { UsersModule } from "./users/users.module";
import { onError, ORPCModule, ORPCError } from "@orpc/nest";

@Module({
  imports: [
    ORPCModule.forRoot({
      interceptors: [
        onError((error: any) => {
          // Check if this is a validation error with arktype issues
          const validationError = error.cause;
          if (validationError?.issues) {
            // Use arktype's built-in summary for human-readable error messages
            const summary =
              validationError.issues.summary ||
              validationError.issues.toString();
            const enhancedMessage = `Output validation failed: ${summary}`;

            // Log the validation error on the server
            console.error(enhancedMessage);
            if (error.data) {
              console.error("Data:", error.data);
            }

            // Throw a new error with the formatted message
            throw new ORPCError("INTERNAL_SERVER_ERROR", {
              message: enhancedMessage,
              data: error.data,
            });
          }

          // For other errors, just log and rethrow
          console.error(error);
          throw error;
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
