const employeeBenefits = {
    type: 'object',
    additionalProperties: false,
    required: [
        "partitionKey",
        "sortKey",
        "username",
        "id",
        "firstName",
        "lastName",
        "dependants",
        "salary",
        "gross",
        "benefitsCost",
        "net"
    ],
    properties: {
        partitionKey: { type: 'string' },
        sortKey: { type: 'string' },
        username: { type: 'string' },
        id: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        dependants: { type: 'number' },
        salary: { type: 'number' },
        gross: { type: 'number' },
        benefitsCost: { type: 'number' },
        net: { type: 'number' }
    }
};

export default {
    employeeBenefits
};