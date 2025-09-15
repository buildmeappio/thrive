module.exports = {
	apps: [
		{
			name: "thrive-examiner",
			script: "npm",
			args: "run start -- -p 3001",
			exec_mode: "fork",
			instances: 1,
			env: { NODE_ENV: "production" },
			cwd: "./",
		},
	],
};