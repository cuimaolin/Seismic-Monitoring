# -*- coding: utf-8 -*-
"""
Created on Fri Apr  6 11:56:16 2018

@author: amanda
"""


import numpy as np
import scipy
import math
import datetime
import numpy
import os
import io
from scipy.signal import lfilter
from scipy.linalg import expm
import numpy.linalg as lin
import pandas as pd

#import data in cm/s2
def getPSAparameters(stationName, fileName, bucket):
    Time = []
    Data1 = []
    Data2 = []
    Data3 = []
    """
    读取数据
    """
    cmpssFileName = stationName + "_" + fileName.split(".")[0] + "cmpss.csv"
    bucket.download_file('data/' + stationName + '_DataFiles/' + cmpssFileName, cmpssFileName)

    # Import Data
    Data = pd.read_csv(cmpssFileName, names=['T', 'A1', 'A2', 'A3'])
    Time = Data['T'].values
    gacc1 = Data['A1'].values
    gacc2 = Data['A2'].values
    gaccv = Data['A3'].values

    '''
    ftp = FTP('ftp.rmbesc.com')
    ftp.login("rmbesc", "c1ph3r")
    ftp.cwd('data/' + stationName + '_DataFiles')
    
    file = io.BytesIO()
    cmpssFileName = stationName + "_" + fileName.split(".")[0] + "cmpss.csv"
    ftp.retrbinary('RETR ' + cmpssFileName, file.write)
    file.seek(0)
    file = io.TextIOWrapper(file, encoding='utf-8').read().split()
    for row in file:
        row = row.split(',')
        Time.append(float(row[0]))
        Data1.append(float(row[1]))
        Data2.append(float(row[2]))
        Data3.append(float(row[3]))
    Time = numpy.asarray(Time)
    gacc1 = numpy.asarray(Data1)
    gacc2 = numpy.asarray(Data2)
    gaccv = numpy.asarray(Data3)
    '''
    """
    进行计算
    """
    dt=0.004
    xi=0.05
    sPeriod = [0.05, 0.1, 0.3, 0.5, 1.0, 2.0, 3.0]
    n = len(sPeriod)
    m = gaccv.size
    i = 0
    displv_max = np.zeros((n))
    displ1_max = np.zeros((n))
    displ2_max = np.zeros((n))
    PSAv = np.zeros((n))
    PSA1 = np.zeros((n))
    PSA2 = np.zeros((n))
    PSAp = np.zeros((n))
    while i < n:
        omegan = 2*math.pi/sPeriod[i]
        C = 2*xi*omegan
        K = np.power(omegan, 2)
        A = np.array([[0, 1], [-K, -C]])
        Ae = expm(np.multiply(A, dt))
        AeB = np.dot(lin.solve(A, (Ae-np.eye(2))), [[0], [1]])
        k = 1
        z = np.zeros((2, m))
        y = np.zeros((2, m))
        x = np.zeros((2, m))
        while k < m:
            z[:,[k]]= np.dot(AeB, gaccv[k]) + np.dot(Ae,z[:, [k-1]])
            y[:,[k]]= np.dot(AeB, gacc2[k]) + np.dot(Ae,y[:, [k-1]])
            x[:,[k]]= np.dot(AeB, gacc1[k]) + np.dot(Ae,x[:, [k-1]])
            k+=1
        displv = z[[0], :]
        displ1 = x[[0], :]
        displ2 = y[[0], :]
        displv_max[i] = np.ndarray.max(abs(displv))
        displ1_max[i] = np.ndarray.max(abs(displ1))
        displ2_max[i] = np.ndarray.max(abs(displ2))
        PSAv[i] = displv_max[i]*np.power(omegan, 2)
        PSA1[i] = displ1_max[i]*np.power(omegan, 2)
        PSA2[i] = displ2_max[i]*np.power(omegan, 2)
        i+=1
    """
    存储结果
    """
    PSA=np.stack((sPeriod, PSA1, PSA2, PSAv), axis=-1)
    PSAFileName = stationName + "_" + fileName.split(".")[0] + "PSA.csv"
    numpy.savetxt(PSAFileName, PSA, delimiter=",")
    #ftp.cwd('../' + stationName + '_DataFiles')
    #ftp.storbinary("STOR " + PSAFileName, open(PSAFileName, "rb"), 1024)
    #ftp.quit()
    bucket.upload_file(PSAFileName, 'data/' + stationName + '_DataFiles/' + PSAFileName)
    os.remove(PSAFileName)