const {
  collections: { customerOrderData },
} = require("@database/router");
const schedule = require("node-schedule");

const { writeFileSync, readFileSync } = require("fs");

const { CSV } = require("@controllers/csv");
const logger = require("@libs/utils/logger");
const chalk = require("chalk");

const sessionChatDataInjection = {
  generalInfo: [
    {
      role: "user",
      parts: [
        {
          text: readFileSync("./assets/data/general-information.txt", "utf-8"),
        },
      ],
    },
    {
      role: "model",
      parts: [
        {
          text: `Understood, please let me know the next instructions or any specific details you need further analyzed or processed from this data.`,
        },
      ],
    },
  ],
  anotheInfo: "PARTS",
};

const getProductsDataFunctionDeclaration = {
  name: "get_products_data",
  parameters: {
    type: "OBJECT",
    description: "Search for products by partial title match",
    properties: {
      query: {
        type: "STRING",
        description: "The partial product title to search for.",
      },
    },
    required: ["query"],
  },
};

const getSingleOrderDataFunctionDeclaration = {
  name: "get_single_order_data",
  parameters: {
    type: "OBJECT",
    description: "Get single customer order data by given ORD-ID",
    properties: {
      orderId: {
        type: "STRING",
        description:
          "The order ID to search for, the recognized pattern is 'ORD-ID-XXX'.",
      },
    },
    required: ["orderId"],
  },
};

const getOngoingOrderTableDataFunctionDeclaration = {
  name: "get_ongoing_order_data",
  parameters: {
    type: "OBJECT",
    description: "Get data for ongoing customer orders",
    properties: {
      keyword: {
        type: "STRING",
        description: `Keyword 'ongoing order' to access the function call object.`,
      },
    },
  },
};

const getCompletedOrderTableDataFunctionDeclaration = {
  name: "get_completed_order_data",
  parameters: {
    type: "OBJECT",
    description: "Get data for completed customer orders",
    properties: {
      keyword: {
        type: "STRING",
        description: `Keyword 'completed order' to access the function call object.`,
      },
    },
  },
};

const functionCallMapper = {
  /**
   * @param { { query: string } } param0
   */
  get_products_data: async ({ query }) => {
    const csvData = await CSV.getProductTableData(query);
    return {
      status: csvData ? "success" : "failed",
      data: csvData,
    };
  },
  /**
   * @param { { orderId: string } } param0
   */
  get_single_order_data: async ({ orderId }) => {
    const csvData = await CSV.getSingleOrderTableData(orderId);
    return {
      status: csvData ? "success" : "failed",
      data: csvData,
    };
  },
  get_ongoing_order_data: async () => {
    const csvData = await CSV.getOngoingOrderTableData();
    return {
      status: csvData ? "success" : "failed",
      data: csvData,
    };
  },
  get_completed_order_data: async () => {
    const csvData = await CSV.getCompletedOrderTableData();
    return {
      status: csvData ? "success" : "failed",
      data: csvData,
    };
  },
};

class Injection {
  static async getCurrentOngoingOrdersCount() {
    const orderStatusCounts = await customerOrderData
      .aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();
    let output = "";
    orderStatusCounts.forEach((item) => {
      const status = item._id;
      const count = item.count;
      output += `${status}: ${count} order\n`;
    });
    if (output === "") {
      return "Currently No order data found.";
    }
    return `Current Order Data\n\n${output}`;
  }

  static async getOngoingOrdersData() {
    const data = await CSV.getOngoingOrderTableData();
    return data ? data : `Currently no ongoing order data found.`;
  }

  static async getCompletedOrdersData() {
    const data = await CSV.getCompletedOrderTableData();
    return data ? data : `Currently no completed order data found.`;
  }

  static async appendUpdateData() {
    const [countOrders, ongoing, completed] = await Promise.all([
      this.getCurrentOngoingOrdersCount(),
      this.getOngoingOrdersData(),
      this.getCompletedOrdersData(),
    ]);
    const data =
      `-- API Response - RAW Data --\n\n` +
      `Order Data Count and Status\n` +
      `${countOrders}\n\n` +
      `Ongoing Order\n` +
      `${ongoing}\n\n` +
      `Completed Order\n` +
      `${completed}`;
    writeFileSync("./assets/data/general-information.txt", data);
    return;
  }
}

Injection.appendUpdateData().then(() => {
  logger.info(chalk.magentaBright("Dataset API Response Updated!"));
  return;
});

schedule.scheduleJob("0 */2 * * *", async () => {
  await Injection.appendUpdateData();
  logger.info("Dataset API Response Updated by Schedule!");
  return;
});

/**
 * @type { import("@google/generative-ai").FunctionDeclarationsTool[] }
 */
const functionDeclarationsTool = [
  {
    functionDeclarations: getProductsDataFunctionDeclaration,
  },
  // {
  //   functionDeclarations: getOngoingOrderTableDataFunctionDeclaration,
  // },
  // {
  //   functionDeclarations: getCompletedOrderTableDataFunctionDeclaration,
  // },
  // {
  //   functionDeclarations: getSingleOrderDataFunctionDeclaration,
  // },
];

/**
 *
 * @param { ReturnType<typeof functionCallMapper> } apiresponse
 */
function functionApiResponseMapper(apiresponse) {
  /**
   * @type { import("@google/generative-ai").Part[] }
   */
  const functionApiResponse = [
    {
      functionResponse: {
        name: "get_products_data",
        response: apiresponse,
      },
    },
    // {
    //   functionResponse: {
    //     name: "get_ongoing_order_data",
    //     response: apiresponse,
    //   },
    // },
    // {
    //   functionResponse: {
    //     name: "get_completed_order_data",
    //     response: apiresponse,
    //   },
    // },
    // {
    //   functionResponse: {
    //     name: "get_single_order_data",
    //     response: apiresponse,
    //   },
    // },
  ];
  return functionApiResponse;
}

module.exports = {
  functionDeclarationsTool,
  functionApiResponseMapper,
  functionCallMapper,
  sessionChatDataInjection,
  Injection,
};
