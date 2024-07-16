import "@testing-library/jest-dom";
import mock from "jest-mock-extended/lib/Mock";
// jest.setup.js
import "text-encoding";
import util from "util/types";

global.TextEncoder = util.TextEncoder || require("util").TextEncoder;
global.TextDecoder = util.TextDecoder || require("util").TextDecoder;
process.env.SUPPRESS_JEST_WARNINGS = "true";
