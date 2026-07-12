/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/solpoll.json`.
 */
export type Solpoll = {
  address: "FQC1y8nNHPZqYtc7aTJ7rRkRwVqZdtevjg1dHCEKiB6x";
  metadata: {
    name: "solpoll";
    version: "0.1.0";
    spec: "0.1.0";
    description: "Created with Anchor";
  };
  instructions: [
    {
      name: "castVote";
      discriminator: [20, 212, 15, 189, 69, 180, 69, 151];
      accounts: [
        {
          name: "voter";
          docs: ["The account of the voter"];
          writable: true;
          signer: true;
        },
        {
          name: "poll";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [112, 111, 108, 108];
              },
              {
                kind: "arg";
                path: "pollId";
              },
            ];
          };
        },
        {
          name: "voterState";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [118, 111, 116, 101, 114];
              },
              {
                kind: "account";
                path: "voter";
              },
              {
                kind: "arg";
                path: "pollId";
              },
            ];
          };
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "pollId";
          type: "u64";
        },
        {
          name: "voteType";
          type: {
            defined: {
              name: "voteType";
            };
          };
        },
      ];
    },
    {
      name: "closePoll";
      discriminator: [139, 213, 162, 65, 172, 150, 123, 67];
      accounts: [
        {
          name: "closer";
          writable: true;
          signer: true;
        },
        {
          name: "poll";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [112, 111, 108, 108];
              },
              {
                kind: "arg";
                path: "pollId";
              },
            ];
          };
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "pollId";
          type: "u64";
        },
      ];
    },
    {
      name: "initializePoll";
      discriminator: [193, 22, 99, 197, 18, 33, 115, 117];
      accounts: [
        {
          name: "payer";
          writable: true;
          signer: true;
        },
        {
          name: "poll";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [112, 111, 108, 108];
              },
              {
                kind: "arg";
                path: "pollId";
              },
            ];
          };
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "pollId";
          type: "u64";
        },
        {
          name: "title";
          type: "string";
        },
        {
          name: "description";
          type: "string";
        },
        {
          name: "startTime";
          type: "u64";
        },
        {
          name: "endTime";
          type: "u64";
        },
      ];
    },
  ];
  accounts: [
    {
      name: "poll";
      discriminator: [110, 234, 167, 188, 231, 136, 153, 111];
    },
    {
      name: "voterState";
      discriminator: [251, 152, 76, 161, 77, 177, 239, 208];
    },
  ];
  errors: [
    {
      code: 6000;
      name: "invalidPollDuration";
      msg: "Invalid poll duration";
    },
    {
      code: 6001;
      name: "pollNotStarted";
      msg: "Poll haven't started yet";
    },
    {
      code: 6002;
      name: "pollAlreadyEnded";
      msg: "Poll have already endend";
    },
    {
      code: 6003;
      name: "pollNotEnded";
      msg: "Poll haven't ended yet";
    },
    {
      code: 6004;
      name: "inactivePoll";
      msg: "Poll is inactive";
    },
    {
      code: 6005;
      name: "alreadyVoted";
      msg: "Already voted";
    },
    {
      code: 6006;
      name: "invalidTitle";
      msg: "Invalid title";
    },
    {
      code: 6007;
      name: "invalidDescription";
      msg: "Invalid description";
    },
    {
      code: 6008;
      name: "customError";
      msg: "Custom error message";
    },
  ];
  types: [
    {
      name: "poll";
      type: {
        kind: "struct";
        fields: [
          {
            name: "pollId";
            docs: ["Address of the poll"];
            type: "u64";
          },
          {
            name: "title";
            docs: ["Title of the poll"];
            type: "string";
          },
          {
            name: "description";
            docs: ["Description of the poll"];
            type: "string";
          },
          {
            name: "startTime";
            docs: ["Start time of the poll"];
            type: "u64";
          },
          {
            name: "endTime";
            docs: ["End time of the poll"];
            type: "u64";
          },
          {
            name: "totalUpVote";
            docs: ["Total Up votes for the poll"];
            type: "u64";
          },
          {
            name: "totalDownVote";
            docs: ["Total Down votes for the poll"];
            type: "u64";
          },
          {
            name: "totalVote";
            docs: ["Total votes for the poll"];
            type: "u64";
          },
          {
            name: "bump";
            docs: ["Bump seed for the poll"];
            type: "u8";
          },
          {
            name: "state";
            docs: ["State of the poll"];
            type: {
              defined: {
                name: "pollState";
              };
            };
          },
        ];
      };
    },
    {
      name: "pollState";
      type: {
        kind: "enum";
        variants: [
          {
            name: "active";
          },
          {
            name: "closed";
          },
        ];
      };
    },
    {
      name: "voteType";
      type: {
        kind: "enum";
        variants: [
          {
            name: "upVote";
          },
          {
            name: "downVote";
          },
          {
            name: "abstain";
          },
        ];
      };
    },
    {
      name: "voterState";
      type: {
        kind: "struct";
        fields: [
          {
            name: "voteType";
            docs: ["Type of the vote"];
            type: {
              defined: {
                name: "voteType";
              };
            };
          },
          {
            name: "hasVoted";
            type: "bool";
          },
          {
            name: "votedAt";
            docs: ["Timestamp of the vote"];
            type: "u64";
          },
        ];
      };
    },
  ];
  constants: [
    {
      name: "seed";
      type: "string";
      value: '"anchor"';
    },
  ];
};
