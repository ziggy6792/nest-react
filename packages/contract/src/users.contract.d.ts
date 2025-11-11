import { z } from "zod";
export declare const User: z.ZodObject<{
    id: z.ZodNumber;
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id?: number;
    name?: string;
}, {
    id?: number;
    name?: string;
}>;
export declare const CreateUser: z.ZodObject<{
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name?: string;
}, {
    name?: string;
}>;
export declare const users: {
    list: {
        method: "GET";
        path: "/api/users";
        responses: {
            200: z.ZodArray<z.ZodObject<{
                id: z.ZodNumber;
                name: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                id?: number;
                name?: string;
            }, {
                id?: number;
                name?: string;
            }>, "many">;
        };
    };
    byId: {
        pathParams: z.ZodObject<{
            id: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id?: string;
        }, {
            id?: string;
        }>;
        method: "GET";
        path: "/api/users/:id";
        responses: {
            200: z.ZodObject<{
                id: z.ZodNumber;
                name: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                id?: number;
                name?: string;
            }, {
                id?: number;
                name?: string;
            }>;
        };
    };
    add: {
        method: "POST";
        body: z.ZodObject<{
            name: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name?: string;
        }, {
            name?: string;
        }>;
        path: "/api/users";
        responses: {
            201: z.ZodObject<{
                id: z.ZodNumber;
                name: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                id?: number;
                name?: string;
            }, {
                id?: number;
                name?: string;
            }>;
        };
    };
};
//# sourceMappingURL=users.contract.d.ts.map