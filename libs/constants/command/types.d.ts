export type PrivateModules = {
  [Category in "admin" | "customer" | "general"]: {
    aliases: string;
    description: string | null;
  }[];
};

type CategoryCmd = "admin" | "customer" | "general";

export type CommandModules = {
  [category: string]: {
    name: string;
    category: string;
    strict: "admin" | "common";
    typeArgs: string;
    expectedArgs: string;
    exampleArgs: string;
    description: string | null;
  }[];
};
