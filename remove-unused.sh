#!/bin/bash

echo "Removing unused imports in backend middleware..."

# Remove unused Request from performanceMonitoring.ts
sed -i '' "s/import { Request, Response, NextFunction } from 'express';/import { Response, NextFunction } from 'express';/g" packages/backend/src/middleware/performanceMonitoring.ts

# Remove unused Response, NextFunction from logResponseTime.ts
sed -i '' "s/import { Request, Response, NextFunction } from 'express';/import { Request } from 'express';/g" packages/backend/src/middleware/logResponseTime.ts

# Remove unused authMiddleware from prdRoutes.ts
sed -i '' "/authMiddleware,/d" packages/backend/src/routes/prdRoutes.ts

# Remove unused validatePrdAnalysisRequest from prdRoutes.ts
sed -i '' "/validatePrdAnalysisRequest,/d" packages/backend/src/routes/prdRoutes.ts

# Remove unused rateLimiter from prdRoutes.ts
sed -i '' "/import { rateLimiter } from/d" packages/backend/src/routes/prdRoutes.ts

# Remove unused Request from performanceController.ts
sed -i '' "s/import { Request, Response } from 'express';/import { Response } from 'express';/g" packages/backend/src/controllers/performanceController.ts

# Remove unused next from commonRoutes.ts
sed -i '' "/next/d" packages/backend/src/routes/commonRoutes.ts

# Remove unused TerminalSession from terminalSessionController.ts
sed -i '' "s/, TerminalSession//g" packages/backend/src/controllers/terminalSessionController.ts

# Remove unused terminalWebSocketService from terminalSessionController.ts
sed -i '' "/terminalWebSocketService/d" packages/backend/src/controllers/terminalSessionController.ts

echo "Done removing unused imports!"