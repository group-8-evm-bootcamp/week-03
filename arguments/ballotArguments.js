const { toHex } = require("viem");

const proposals = ["cats", "dogs", "rats"];

const proposalNames = proposals.map((name) => toHex(name, { size: 32 }));

module.exports = [
  proposalNames,
  "0x6aa41b06c351d56ee34b9c447b3cdb23590e3b22",
  "6572934",
];
