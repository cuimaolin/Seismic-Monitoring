# -*- coding: utf-8 -*-
"""
Created on Thu Apr  5 14:08:16 2018

@author: amanda
"""

import numpy
import os
import io
import time
import pandas as pd



def processData(fileName, stationName, unit, bucket):
    print("Start processing data.")


    bucket.download_file('data/' + stationName + '/' + fileName, fileName)

    #Import Data
    Data = pd.read_csv(fileName, names=['T', 'A1', 'A2', 'A3'], dtype={'T': 'float64', 'A1': 'float64',
                                                                       'A2': 'float64', 'A3': 'float64'})
    time = Data['T'].values
    A1 = Data['A1'].values
    A2 = Data['A2'].values
    A3 = Data['A3'].values

    '''
    ftp = FTP('ftp.rmbesc.com')
    ftp.login("rmbesc", "c1ph3r")
    ftp.cwd('data/' + stationName)
    file = io.BytesIO()
    ftp.retrbinary('RETR ' + fileName, file.write)
    file.seek(0)
    file = io.TextIOWrapper(file, encoding='utf-8').read().split()
    time = []
    A1 = []
    A2 = []
    A3 = []
    for row in file:
        row = row.split(',')
        time.append(float(row[0]))
        A1.append(float(row[1]))
        A2.append(float(row[2]))
        A3.append(float(row[3]))
    time = numpy.asarray(time)
    A1 = numpy.asarray(A1)
    A2 = numpy.asarray(A2)
    A3 = numpy.asarray(A3)
    '''
    # time=t/86400+25569;
    # convert data to accelerations in ug
    A1m = (A1 - A1.mean());
    A2m = (A2 - A2.mean());
    A3m = (A3 - A3.mean());
    A1mg = A1m / .256;
    A2mg = A2m / .256;
    A3mg = A3m / .256;
    # convert data to accerlations in cm/s2
    A1cmpss = A1mg * .000981;
    A2cmpss = A2mg * .000981;
    A3cmpss = A3mg * .000981;
    # stack time and accelerations into an array
    Dmg = numpy.stack((time, A1mg, A2mg, A3mg), axis=-1)
    Dcmpss = numpy.stack((time, A1cmpss, A2cmpss, A3cmpss), axis=-1)
    T = numpy.stack((time, A1m, A2m, A3m), axis=-1)
    # convert array to dataframe
    # P=pd.DataFrame(Dmg)
    # D=pd.DataFrame(Dcmpss)
    # T1=pd.DataFrame(T)
    # print the corrected data to csv files
    cmpssFileName = stationName + "_" + fileName.split(".")[0] + "cmpss.csv"
    ugFileName = stationName + "_" + fileName.split(".")[0] + "ug.csv"
    numpy.savetxt(cmpssFileName, Dcmpss, delimiter=",")
    numpy.savetxt(ugFileName, Dmg, delimiter=",")
    # dcmpssEncoded = json.dumps(Dcmpss.tolist()).encode()
    bucket.upload_file(cmpssFileName, 'data/' + stationName + '_DataFiles/' + cmpssFileName)
    bucket.upload_file(ugFileName, 'data/' + stationName + '_DataFiles/' + ugFileName)

    '''
    ftp.cwd('../' + stationName + '_DataFiles')
    ftp.storbinary("STOR " + cmpssFileName, open(cmpssFileName, "rb"), 1024)
    ftp.storbinary("STOR " + ugFileName, open(ugFileName, "rb"), 1024)
    ftp.quit()
    '''
    os.remove(cmpssFileName)
    os.remove(ugFileName)
    os.remove(fileName)
    # D.to_csv(stationName + "_" + fileName.split(".")[0] + "cmpss.csv", index=False, header=False)
    # P.to_csv(stationName + "_" + fileName.split(".")[0] + "ug.csv", index=False, header=False)
    # T1.to_csv("Test.csv", index=False, header=False)
    # plot the accelerations versus time
    i = numpy.arange(0., 304.684, .004)
    i = numpy.arange(0., 8.004, .004)
    # plt.plot(i, A3mg, 'r', i, A2mg, 'b', i, A1mg, 'g')
    # plt.xlabel('Time (s)')
    # plt.ylabel('Acceleration (ug)')
    # plt.show()
    if (unit == "ug"):
        return Dmg
    else:
        return Dcmpss

