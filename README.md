# BlockChain_MeetingPlanner
ESIGELEC-IF-Promo2018-Blockchain project

## How to run
Please make sure you have installed npm 6.9.2 and python 2.7.  
If you are using Windows, you may also need to install Microsoft Build Tools 2013.  
Please run all the following command on the <strong>root path</strong> of the project.

#### First run:  
    npm install

If showing error of python version, please make sure you have installed python 2.7 and run:

    npm config set python python2.7 && npm install

If showing MSBUILD error, run the following command on <strong>POWER SHELL</strong> with <strong>ADMIN</strong>:

    npm install --global --production windows-build-tools
And retry the preview step.

#### First terminal:  
    node_modules/.bin/truffle compile; node_modules/.bin/testrpc

For having same accounts each time:  

    node_modules/.bin/truffle compile; node_modules/.bin/testrpc --account="0x138f02ab2e169b05a086caf596d299d9e3a5e6d7924ae5e20d5cd5384d05ff71, 47123880000000000000" --account="0xb6a3e94a6123e650f5f3d4a2fbb351aada4312972e0dff5313397d7f2704c61b, 47123880000000000000" --account="0x7f020d46fb3545bcfb655464fc7537151cd09dee5e6672654f760497933019e8, 47123880000000000000" --account="0x5ed0e63a4a2446863b3bcf41d639533a14e48c2c72e37f122e2b529ba36e1303, 47123880000000000000" --account="0x9e2eab80ffe6d4ebfae602673fd7f0f4ce0f553a26b6f832ad20ea152ed3155f, 47123880000000000000"

Available Accounts  
==================  
(0) 0x4db2da7660a1e2edc15cacd815c39d0574103cb3  
(1) 0x013ba5d38f3a03c63909d48be7a81df2b60a61f4  
(2) 0xfac6be69d005caa557b2e36c6fb41959188c438c  
(3) 0x465caa1267d97ec054635704ed68102970cb6adc  
(4) 0xea8328fca972e48d9bec1039400be99d4ce760be	

#### Second terminal:  
    node_modules/.bin/truffle migrate; node_modules/.bin/truffle serve

#### Navigator:
    http://localhost:8080/
