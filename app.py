from flask import Flask, render_template, request
from data_processor_cm import processData
from csv_to_miniseed import data_to_Miniseed
from parameters_9 import getParameters
from parameters_psa import getPSAparameters
import json
import zipfile
import os
import time
import csv
import boto3

app = Flask(__name__)
dataCount = []
bucketName = 'ubc-dashboard-data'

@app.route('/')
@app.route('/dashboard')
def home():
    """
    dashboard初始化
    """
    fileList = readAllFilesNameInFolder()
    stationList = readStation()
    kmlFileList = os.listdir(os.getcwd() + '/static/shp')
    return render_template('dashboard.html', fileList=fileList, stationList=stationList, kmlFileList=kmlFileList)

def readAWSAccessKey():
    """
    连接amazon s3
    """
    basedir = os.path.abspath(os.path.dirname(__file__))
    data_file = os.path.join(basedir, 'static/accessKeys.csv')
    keys = []
    with open(data_file, "r") as file:
        for line in file.readlines():
            keys.append(line.rstrip())
    keysSplited = keys[1].split(',')
    ACCESS_ID = keysSplited[0]
    ACCESS_KEY = keysSplited[1]

    s3 = boto3.resource('s3',
                        aws_access_key_id=ACCESS_ID,
                        aws_secret_access_key=ACCESS_KEY)

    return s3

def readAllFilesNameInFolder(stationName=None):
    """
    从aws s3得到中得到fileList
    """
    if stationName == None:
        stationName = 'p2407'

    fileNameList = []
    s3 = readAWSAccessKey()
    bucket = s3.Bucket(bucketName)
    for obj in bucket.objects.filter(Delimiter='/', Prefix='data/' + stationName + '/'):
        if '_gsdata_' not in obj.key:
            if 'adxl' not in obj.key:
                fileNameList.append(obj.key.split('/')[2])
    print(fileNameList)

    return fileNameList[::-1]

@app.route('/updateMarkerColor', methods=['POST'])
def updateMarkerColor():
    """
    更新data/'role'.json的stationlist
    1. 每个传入station的在aws s3中的文件数量(data/'station'),存储到updatedFileData中
    2. 得到data/'role'记录的file数目，记录在originalFileData中
    3. 将updatedFileData与originalFileData记录数量不同的station添加到updatedStationList中，
    3. updatedFileData更新data/'role'.json
    5. 返回updatedStationList
    返回
    """
    parameters = request.get_json()
    role = parameters['role']
    stations = parameters['stations']

    s3 = readAWSAccessKey()
    bucket = s3.Bucket(bucketName)

    '''
    ftp = FTP('ftp.rmbesc.com')
    ftp.login("rmbesc", "c1ph3r")
    ftp.cwd('data/p2407')
    '''
    #Reading Updated Data
    updatedFileData = []        # 存储每个传入station在aws对应文件夹中file的数目
    originalFileData = []       # data/role.json记录的file数目
    updatedStationList = []     # 存储data/role.json对应记录与在aws中file数量不同的station
    count = 0
    for station in stations:
        count = 0
        #ftp.cwd('../' + station)
        #filelist = ftp.nlst()
        for obj in bucket.objects.filter(Delimiter='/', Prefix='data/' + station + '/'):
            count = count + 1
        updatedFileData.append({'station': station, 'count': count})
    fileName = role + '.json'
    #ftp.cwd('../')
    #ftp.retrbinary("RETR " + fileName, open(fileName, 'wb').write)

    bucket.download_file('data/' + fileName, fileName)

    #Reading Original File
    with open(fileName) as json_file:
        data = json.load(json_file)
        for p in data:
            originalFileData.append(p)
    index = 0
    if (len(originalFileData) == len(updatedFileData)):
        for fileData in updatedFileData:
            if (fileData['count'] != originalFileData[index]['count']):
                updatedStationList.append(fileData['station'])
            index += 1
    with open(fileName, 'w', encoding='utf-8') as f:
        json.dump(updatedFileData, f, ensure_ascii=False, indent=4)

    bucket.upload_file(fileName, 'data/' + fileName)
    #ftp.storbinary("STOR " + fileName, open(fileName, "rb"), 1024)
    #ftp.quit()
    return json.dumps(updatedStationList)

@app.route('/downloadFiles', methods=['POST'])
def downloadFiles():
    #allFilesInFolder =[]
    parameters = request.get_json()
    fileName = parameters['fileName']
    fileArray = parameters['fileArray']
    stationName = parameters['selectedStation']

    fileNameList = []
    s3 = readAWSAccessKey()
    bucket = s3.Bucket(bucketName)
    for obj in bucket.objects.filter(Delimiter='/', Prefix='data/' + stationName + '_DataFiles/'):
        fileNameList.append(obj.key.split('/')[2])

    '''
    ftp = FTP('ftp.rmbesc.com')
    ftp.login("rmbesc", "c1ph3r")
    ftp.cwd('data/' + stationName + '_DataFiles')
    ftp.dir(allFilesInFolder.append)
    for line in allFilesInFolder:
        lineSplited = line.split(" ")
        fileNameList.append(lineSplited[-1])
    '''


    for file in fileArray:
        if file in fileNameList:
            #ftp.retrbinary("RETR " + file, open(file, 'wb').write)
            bucket.download_file('data/' + stationName + '_DataFiles/' + file, file)
    datalessFilesName = 'bustin_' + stationName + '.dataless'
    datalessFlag = False
    if datalessFilesName in fileNameList:
        #ftp.retrbinary("RETR " + datalessFilesName, open(datalessFilesName, 'wb').write)
        bucket.download_file('data/' + stationName + '_DataFiles/' + datalessFilesName, datalessFilesName)
        datalessFlag = True
    #ftp.quit()
    with zipfile.ZipFile('static/' + stationName + '_' + fileName + '.zip', 'w') as newzip:
        for file in fileArray:
            newzip.write(file)
            os.remove(file)
        if datalessFlag:
            newzip.write(datalessFilesName)
            os.remove(datalessFilesName)
    return json.dumps({'result': True})

@app.route('/removeFile', methods=['POST'])
def removeFile():
    parameters = request.get_json()
    fileName = parameters['fileName']
    time.sleep(1)
    os.remove('static/' + fileName)
    return json.dumps({'result': True})

@app.route('/processFileSelection', methods=['POST'])
def processFileSelection():

    parameters = request.get_json()
    fileName = parameters['selectedFile']
    selectedStation = parameters['selectedStation']
    unit = parameters['unit']
    s3 = readAWSAccessKey()
    bucket = s3.Bucket(bucketName)
    csvData = processData(fileName, selectedStation, unit, bucket).tolist()
    data_to_Miniseed(selectedStation, fileName, bucket)
    getPSAparameters(selectedStation, fileName, bucket)

    return json.dumps(csvData)

@app.route('/getParameters', methods=['POST'])
def getParametersHome():
    parameters = request.get_json()
    fileName = parameters['selectedFile']
    selectedStation = parameters['selectedStation']
    s3 = readAWSAccessKey()
    bucket = s3.Bucket(bucketName)
    parameters = getParameters(fileName, selectedStation, bucket)
    return parameters

@app.route('/getFilesInStationFolder', methods=['POST'])
def getFilesInStationFolder():
    stationName = request.get_json()
    fileList = readAllFilesNameInFolder(stationName)
    return json.dumps(fileList)

@app.route('/removeNoiseFile', methods=['DELETE'])
def removeNoiseFile():
    parameters = request.get_json()
    fileName = parameters['fileName']
    stationName = parameters['stationName']

    s3 = readAWSAccessKey()
    s3.Object(bucketName, 'data/' + stationName + '/' + fileName).delete()

    return json.dumps({'result': True})

def readStation():
    """
    从本地的iris_new.csv中得到stationList
    """
    stationList = []
    with open('iris_new.csv') as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        for row in csv_reader:
            if row[1] == 'STATION':
                continue
            station = {'lat': row[2], 'lng': row[3], 'name': row[1]}
            stationList.append(station)
    return stationList

if __name__ == '__main__':
    app.run(debug=True)
