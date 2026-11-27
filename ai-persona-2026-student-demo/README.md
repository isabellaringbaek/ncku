# AI Persona 2026 — Student Demo

This is the student starter project for the Creative Product Design course. It includes a working AI Persona named **Ella**, an OpenAI Agent, a small Express server, and a browser-based chat interface.

**Learning goal:** design an AI's behavior by changing its surrounding application, instructions, and context — without retraining the underlying language model.

## Class challenges

1. **Clone and run** this project on your own computer.
2. **Publish your own copy** to a new GitHub repository.
3. Use **AI-assisted coding** to give Ella **session memory**, so she can recall earlier messages in the same conversation.
4. **Extend the Persona creatively** and demonstrate how your design changes its behavior.

Start by confirming the original version works. **Do not add memory before testing the original behavior.**

## Before you begin

- Install **Git**, **VS Code**, and a current **Node.js LTS** release (Node.js 22 or later is recommended).
- Have a **GitHub account**. This teacher repository is private: you need access permission to clone it.
- Have an **OpenAI API key** with available API credits and access to the model specified in the project's configuration. ChatGPT subscriptions and API billing are separate.

Check your terminal:

~~~bash
git --version
node --version
npm --version
~~~

## 1. Clone the repository

In VS Code, use **Source Control → Clone Repository**, paste the repository URL, and select a local folder. Or use the terminal:

~~~bash
git clone https://github.com/weichichien/ai-persona-2026-student-demo.git
cd ai-persona-2026-student-demo
~~~

Open the cloned project folder in VS Code. If GitHub reports a permission error, confirm that your GitHub account has access to this private repository.

## 2. Install dependencies and configure the API key

Open the **VS Code Terminal** in the project folder:

~~~bash
npm install
~~~

Make a copy of **.env.example** in the project root and name the copy **.env**. Edit the copy:

~~~dotenv
OPENAI_API_KEY=your_actual_openai_api_key
OPENAI_MODEL=gpt-5.6-luna
~~~

Use a model available to your API project if the configured model is not accessible. Never put your real API key in source files, screenshots, or GitHub commits. **.env is excluded by .gitignore**.

**Use npm install rather than npm ci for this starter repository.** The currently committed package-lock.json may be synchronized with package.json by npm install; keep the lockfile rather than deleting it.

## 3. Run the Persona web app

~~~bash
npm start
~~~

Open **http://localhost:3000** in your browser. You should see Ella and be able to send her messages. The API key remains on the local server, not in the browser code.

Keep the terminal open while using the website. Press **Ctrl+C** in the terminal to stop the server. To run the terminal demos below, use a second terminal or stop the server first.

## 4. Explore the three terminal demos

These scripts are retained as independent teaching demonstrations. Run them from the project root after installing dependencies and configuring .env.

| Command | What it demonstrates |
| --- | --- |
| `node scripts/test-openai.js` | A basic OpenAI Responses API request to verify authentication and connectivity. |
| `node scripts/prompt-openai.js` | A direct prompt/response call without an Agent. Type one question in the terminal. |
| `npm run prompt:agent` | A minimal Agent implemented with the OpenAI Agents SDK. Type one question and compare the behavior with the direct call. |

The minimal Agent in **src/agent.js** is intentionally separate from **ellaAgent**. These scripts do **not** provide session memory. They each make an independent request and require a working network connection, valid API credentials, and model access.

## 5. Make this project your own GitHub repository

Cloning does **not** automatically create a repository under your GitHub account. In the cloned folder, Git's **origin** initially points to the teacher's repository.

1. On GitHub, choose **New repository**. Give it a new name (for example, `my-ai-persona`), choose **Private** unless you have a reason to publish it, and **do not** initialize it with a README, .gitignore, or license.
2. In VS Code's terminal, check the existing remote, replace it with your new repository's URL, and push:

~~~bash
git remote -v
git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
~~~

Replace **YOUR_USERNAME** and **YOUR_REPOSITORY** with your own GitHub information. Check `git remote -v` again: **origin should point to your account, not to the teacher's repository**. Refresh your new GitHub repository page to confirm the files arrived.

These steps publish the **source code** to GitHub; they do not deploy a public website. The application still runs locally with `npm start`.

Before every push, review changed files and confirm that **.env and your API key are not included**.

## 6. Try Ella's tab-only conversation memory

The chat stores completed user and Persona turns in the current tab's `sessionStorage` and sends the conversation history to the Agent with each new question. History survives a page refresh in that tab and is cleared when the tab session ends. Separate tabs do not intentionally share history. The initial greeting is not part of the Agent conversation.

Try this:

> User: I have a dog named Cookie.
>
> User: What is my dog's name?

Ella should answer the second question using the first turn. Earlier messages are sent to the model API as conversation context; they are not stored in a server-side database. Long conversations increase API usage and can eventually exceed model context limits. Do not enter sensitive personal information.

Commit and push your working result:

~~~bash
git status
git add .
git commit -m "Add session memory to AI Persona"
git push
~~~

Review `git status` and staged files before committing. If `git add .` staged anything sensitive, unstage it first.

## 7. Creative extension

Once session memory works, develop at least one idea of your own. For example: redesign Ella's personality or role, introduce multiple Personas, add a visible memory/reset control, improve the interview interface, or let the Persona use a tool.

Explain what you changed, why you chose it, and how you verified the behavior. Commit and push this iteration separately so your Git history shows the development process.

## Project structure

~~~text
public/
  index.html             Browser page
  style.css              Visual design
  app.js                 Front-end chat interaction
  assets/                Persona images
src/
  index.js               Express server and /api endpoints
  agent.js               Minimal Agent and Persona Agent instructions
  personas/001.json      Ella's profile and behavior guidance
scripts/
  test-openai.js         API connectivity demo
  prompt-openai.js       Direct Responses API demo
  prompt-agent.js        Minimal Agent demo
.env.example             Safe example of local environment variables
.gitignore               Excludes secrets and local dependencies
package.json             Dependencies and npm scripts
package-lock.json        Dependency lockfile
~~~

Persona identity, interests, and behavior guidelines live in **src/personas/001.json**. **src/agent.js** turns this data into Agent instructions. The back end in **src/index.js** handles requests to OpenAI; **public/app.js** controls the browser conversation.

## Troubleshooting

- **Clone fails:** confirm GitHub login and permission to access the private teacher repository.
- **npm install fails:** check Node.js and npm versions, internet access, and package-manager error output.
- **Missing OPENAI_API_KEY:** check that a real **.env** file exists in the project root.
- **Authentication, quota, or model error:** confirm your API key, billing/credits, and access to the configured model.
- **Cannot open the page:** make sure `npm start` is still running and check the URL and port shown in the terminal.
- **Memory seems to work only in the interface:** inspect the requests to `/api/chat` and confirm earlier turns reach the Agent.

Do not publish API keys, personal interview data, or material you do not have permission to distribute.
