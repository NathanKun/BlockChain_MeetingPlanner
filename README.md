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
  
#### Second terminal:  
    node_modules/.bin/truffle migrate; node_modules/.bin/truffle serve
  
#### Navigator:
    http://localhost:8080/
