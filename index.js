// index.js

import inquirer from 'inquirer';
import chalk from 'chalk';
import clear from 'clear';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

// Untuk mendapatkan __dirname dalam ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path ke repo-list.txt
const REPO_LIST_PATH = path.join(__dirname, 'config', 'repo-list.txt');

// Fungsi untuk membaca repo-list.txt dan mengembalikan array objek repositori
function getRepos() {
    if (!fs.existsSync(REPO_LIST_PATH)) {
        console.log(chalk.red(`File daftar repository tidak ditemukan di ${REPO_LIST_PATH}`));
        process.exit(1);
    }

    const data = fs.readFileSync(REPO_LIST_PATH, 'utf-8');
    const lines = data.split('\n').filter(line => line.trim() !== '' && !line.startsWith('#'));

    const repos = lines.map(line => {
        let url = line.trim();
        // Menghapus ekstensi .git jika ada
        if (url.endsWith('.git')) {
            url = url.slice(0, -4);
        }
        // Mengekstrak nama repository dari URL
        const urlParts = url.split('/');
        const repoName = urlParts[urlParts.length - 1];
        return { name: repoName, url };
    });

    if (repos.length === 0) {
        console.log(chalk.red('Tidak ada repository yang ditemukan di repo-list.txt.'));
        process.exit(1);
    }

    return repos;
}

// Fungsi untuk menjalankan skrip shell
function runScript(scriptPath, args = [], callback) {
    const command = `bash "${scriptPath}" ${args.map(arg => `"${arg}"`).join(' ')}`;

    const child = exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(chalk.red(`Error: ${error.message}`));
            return;
        }
        if (stderr) {
            console.error(chalk.red(`Stderr: ${stderr}`));
            return;
        }
        console.log(chalk.green(stdout));
        if (callback) callback();
    });

    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
}

// Fungsi utama
async function main() {
    // Clear screen di awal
    clear();

    // Baca daftar repositori
    const repos = getRepos();

    // Prompt untuk memilih repository
    const { selectedRepoName } = await inquirer.prompt([
        {
            type: 'list',
            name: 'selectedRepoName',
            message: 'Pilih repository:',
            choices: repos.map(repo => repo.name),
        }
    ]);

    // Dapatkan detail repository
    const repo = repos.find(r => r.name === selectedRepoName);
    if (!repo) {
        console.log(chalk.red('Repository yang dipilih tidak ditemukan.'));
        process.exit(1);
    }

    // Parse URL untuk mendapatkan owner dan repo name
    const urlParts = repo.url.split('/');
    const owner = urlParts[urlParts.length - 2];
    const repoName = urlParts[urlParts.length - 1];

    // Clear screen dan tampilkan detail repository
    clear();
    console.log(chalk.blue('----------------------------------------'));
    console.log(chalk.yellow('Detail Repository:'));
    console.log(`${chalk.green('GitHub')}       : ${owner}`);
    console.log(`${chalk.green('Remote Repo')} : ${repoName}`);
    console.log(chalk.blue('----------------------------------------\n'));

    // Prompt untuk memilih aksi
    const { action } = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'Pilih aksi yang ingin dilakukan:',
            choices: [
                { name: 'Set Remote', value: 'set-remote' },
                { name: 'Pull', value: 'pull' },
                { name: 'Push', value: 'push' },
                { name: 'Keluar', value: 'exit' }
            ],
        }
    ]);

    // Handle aksi yang dipilih
    switch(action) {
        case 'set-remote':
            clear();
            console.log(chalk.blue('Menjalankan Set Remote...\n'));
            runScript(path.join(__dirname, 'src', 'set-remote.sh'), [repo.url], main);
            break;

        case 'pull':
            clear();
            console.log(chalk.blue('Menjalankan Pull...\n'));
            runScript(path.join(__dirname, 'src', 'pull.sh'), [], main);
            break;

        case 'push':
            // Prompt untuk pesan commit
            const { commitMessage } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'commitMessage',
                    message: 'Masukkan pesan commit:',
                    validate: function(input) {
                        if (input.trim() === '') {
                            return 'Pesan commit tidak boleh kosong!';
                        }
                        return true;
                    }
                }
            ]);

            clear();
            console.log(chalk.blue('Menjalankan Push...\n'));
            runScript(path.join(__dirname, 'src', 'push.sh'), [commitMessage], main);
            break;

        case 'exit':
            console.log(chalk.green('Terima kasih!'));
            process.exit(0);
            break;

        default:
            console.log(chalk.red('Aksi tidak dikenali.'));
            main();
    }
}

// Jalankan fungsi utama
main();
