//módulos externos
import inquirer from 'inquirer';
import chalk from 'chalk';

//módulos internos
import fs from 'fs';

const prompt = inquirer.createPromptModule();

operation();

function operation(){
    const questions = [
        {
            type: 'list',
            name: 'action',
            message: 'O que você deseja fazer?',
            choices: ['Criar conta','Consultar saldo','Depositar','Sacar','Sair']
        }
    ];
    
    prompt(questions)
    .then(({action})=>{
        choices(action);
    })
    .catch((err)=>{console.log(err)});
}

//create an account
function createAccount(){
    console.log(chalk.bgGreen.black('Parabéns por escolher o nosso banco!'));
    console.log(chalk.green('Defina as opções da sua conta a seguir'));
    buildAccount();
}

function buildAccount(){
    const questions = [
        {
            name : 'accountName',
            message : 'Digite um nome para a sua conta:'
        }   
    ];
    prompt(questions).then(({accountName})=>{

        if(!fs.existsSync('accounts')){
            fs.mkdirSync('accounts');
        }

        if(fs.existsSync(pathAccount(accountName))){
            console.log(chalk.bgRed.black('Esta conta já existe, escolha outro nome'));
            buildAccount();
            return;
        }

        fs.writeFileSync(`accounts/${accountName}.json`,'{"balance":0}', (err)=>{
            console.log(err);
        });

        console.log(chalk.green('Parabéns, A sua conta foi criada!'));
        operation();
    }).catch(err=> console.log(err))
}

//add an amount to user account
function deposit(){
    const questions = [
        {
            name:'accountName',
            message: 'Qual o nome da sua conta?'
        },
        {
            name:'amount',
            message: 'Quantos você deseja depositar?'
        }
    ];
    prompt(questions[0])
    .then(({ accountName })=>{
        //verify if account exists
        if(!checkAccount(accountName)){
            return deposit();
        }

        prompt(questions[1]).then(({amount})=>{
            addAmount(accountName, amount);
        }).catch(err => console.log(err));
    }).catch(err => console.log(err));
}

function choices(action){
    if(action === 'Criar conta'){
        createAccount();
    }else if(action === 'Consultar saldo'){
        getAccountBalance();
    }else if(action === 'Depositar'){
        deposit();
    }else if(action === 'Sacar'){
        withdraw();
    }else if(action === 'Sair'){
        console.log(chalk.bgBlue.black('Obrigado por usar o Accounts!'))
        process.exit();
    }
}

function checkAccount(accountName){
    if(!fs.existsSync(pathAccount(accountName))){
        console.log(chalk.bgRed.black('Esta conta não existe, escolha um outro nome!'));
        return false;
    }
    
    return true;
}

function addAmount(accountName, amount){
    const accountData = getAccount(accountName);
    if(!amount){
        console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde!'));
        return deposit();
    }

    accountData.balance = parseFloat(amount) + parseFloat(accountData.balance);
    
    fs.writeFileSync(pathAccount(accountName),JSON.stringify(accountData),(err)=> console.log(err));

    console.log(chalk.green(`Foi depositado o valor de R$${amount} na sua conta!`));
    operation();
}

//show account balance
function getAccountBalance(){
    const questions = [
        {
            name : 'accountName',
            message : 'Qual o nome da sua conta?'
        }
    ]
    prompt(questions[0]).then(({accountName})=>{
        if(!checkAccount(accountName)){
            return getAccountBalance();
        }

        const accountData = getAccount(accountName);
        console.log(chalk.bgBlue.black(`Olá, seu saldo é de R$${accountData.balance}`));
        operation();

    }).catch(err => console.log(err));
}

function withdraw(){
    const questions = [
        {
            name : 'accountName',
            message : 'Qual o nome da sua conta?'
        },
        {
            name : 'amount',
            message : 'Quanto você deseja sacar?'
        }
    ]
    prompt(questions[0]).then(({accountName})=>{
        if(!checkAccount(accountName)){
            return withdraw();
        }

        prompt(questions[1]).then(({amount})=>{
            removeAmount(accountName, amount);
        }).catch(err => console.log(err));

    }).catch(err => console.log(err));
}

function removeAmount(accountName, amount){
    const accountData = getAccount(accountName);
    if(!amount){
        console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde!'));
        return withdraw();
    }

    if(parseFloat(accountData.balance) < parseFloat(amount)){
        console.log(chalk.bgRed.black('Valor indisponível'));
        return withdraw();
    }
    
    accountData.balance =  parseFloat(accountData.balance) - parseFloat(amount);
    fs.writeFileSync(pathAccount(accountName), JSON.stringify(accountData),(err)=>{console.log(err)});
    console.log(chalk.green(`Foi realizado um saque de R$${amount} da sua conta!`));
    operation();
}

function getAccount(accountName){
    const accountJSON = fs.readFileSync(pathAccount(accountName),{
        encoding : 'utf8',
        flag : 'r'
    });

    return JSON.parse(accountJSON);
}

function pathAccount(accountName){
    return `accounts/${accountName}.json`;
}