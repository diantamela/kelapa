import "dotenv/config";

const config = {
  datasource: {
    url: process.env.DIRECT_URL || process.env.DATABASE_URL!,
  },
};

export default config;
