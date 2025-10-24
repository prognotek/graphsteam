const fs = require('fs');
const os = require('os');
const https = require('https');
const osType = os.platform();
const path = require('path');
const exec = require('child_process').exec;
const spawn = require('child_process').spawn;

//helper function for handling HTTP get
//based on this stackoverflow post https://stackoverflow.com/a/22907134
const downloadFile = function(url, dest, cb) {
	const file = fs.createWriteStream(dest);
	https.get(url, function(response) {
		response.pipe(file);
		file.on('finish', function() {
			console.log('downloaded ', url, 'to ', dest, ' successfully');
			file.close(cb);
		});
	}).on('error', function(err) {
		fs.unlink(dest);
		if (cb) cb(err.message);
	});
};

const unzipWith7z = function(driverFileName){
	//use 7zip on windows boxes
	const unzip = spawn('7z', ['x', driverFileName, '-aoa', '&&', 'del', driverFileName], {cwd: protractorSeleniumLocation, shell: true});
	unzip.on('close', function(code) {
		console.log(driverFileName, ' 7z unzip process exited with code ', code);
	});
};

const unzipWithUnzip = function(driverFileName){
	//use unzip on unix
	const unzip = spawn('unzip', ['-o', driverFileName], {cwd: protractorSeleniumLocation});
	unzip.on('close', function(code) {
		if (code !== 0) {
			console.log('unzip process exited with code ', code);
		}else{
			console.log(driverFileName, ' unzip process completed');
		}
	});
};

const untarWithGunzipAndTar = function(driverFileName){
	//use gunzip on unix
	const gunzip = spawn('gunzip', ['-fN', driverFileName + '.gz'], {cwd: protractorSeleniumLocation});
	gunzip.stdout.on('data', function(data) {
		fs.writeFile(driverFileName, data, function(err) {
		});
	});

	gunzip.on('close', function(code) {
		if (code !== 0) {
			console.log('gunzip process exited with code ', code);
		}else{
			console.log(driverFileName, ' gunzip completed');
		}

		const tar = spawn('tar', ['xopf', driverFileName], {cwd: protractorSeleniumLocation});
		tar.on('close', function(code) {
			if (code !== 0) {
				console.log('tar process exited with code ', code);
			}else{
				console.log(driverFileName, ' tar process completed');
			}
		});
	});
};

const nexusUrl = "https://www.nexus.ford.com/repository/wamcoe_raw_private_repository/";
const protractorSeleniumLocation = "node_modules/protractor/selenium";
//write stream bails out if the folder doesn't exist. make it first.
if(!fs.existsSync(protractorSeleniumLocation)) {
	fs.mkdirSync(protractorSeleniumLocation);
}

const chromedriverVersion = '87.0.4280.20';
let chromedriverFileName = '';
const geckodriverVersion = '0.28.0';
let geckodriverFileName = '';

if(osType === 'win32') {
	chromedriverFileName = 'chromedriver_win32.zip';
	geckodriverFileName = 'geckodriver-v' + geckodriverVersion + '-win64.zip';
}
else if(osType === 'darwin') {
	chromedriverFileName = 'chromedriver_mac64.zip';
	geckodriverFileName = 'geckodriver-v' + geckodriverVersion + '-macos.tar';
}
else {
	chromedriverFileName = 'chromedriver_linux64.zip';
	geckodriverFileName = 'geckodriver-v' + geckodriverVersion + '-linux64.tar';
}

if(osType === 'win32') {
	downloadFile(nexusUrl + "chromedriver/" + chromedriverVersion + "/" + chromedriverFileName,
		path.join(protractorSeleniumLocation, chromedriverFileName), unzipWith7z.bind(this, chromedriverFileName));
	downloadFile(nexusUrl + "geckodriver/v" + geckodriverVersion + "/" + geckodriverFileName,
		path.join(protractorSeleniumLocation, geckodriverFileName), unzipWith7z.bind(this, geckodriverFileName));
} else {
	downloadFile(nexusUrl + "chromedriver/" + chromedriverVersion + "/" + chromedriverFileName,
		path.join(protractorSeleniumLocation, chromedriverFileName), unzipWithUnzip.bind(this, chromedriverFileName));
	downloadFile(nexusUrl + "geckodriver/v" + geckodriverVersion + "/" + geckodriverFileName + ".gz",
		path.join(protractorSeleniumLocation, geckodriverFileName + ".gz"), untarWithGunzipAndTar.bind(this, geckodriverFileName));
}
