export const validate = (schema: any, obj: any) => {
        const result = schema.safeParse(obj);
        if (!result.success) {
            const errors: { [key: string]: string } = {};
            result.error.errors.forEach((err: any) => {
                if (err.path[0]) errors[err.path[0]] = err.message;
            });
            return {success: false, errors};
        }
        return {success: true, errors: {}};
};