# -*- coding: utf-8 -*-
"""
Created on Fri Apr  6 11:56:16 2018

@author: amanda
"""

import numpy
import scipy
import math
import datetime
import json
from scipy.signal import lfilter
import io
import os
import pandas as pd


# import data
def getParameters(fileName, stationName, bucket):
    # Data = pd.read_csv(stationName + "_" + fileName.split(".")[0] + "cmpss.csv", names=['Time','Data1','Data2','Data3'])
    # convert columns in Dataframe to arrays
    # Time = Data['Time'].values
    # Data1 = Data['Data1'].values
    # Data2 = Data['Data2'].values
    # Data3 = Data['Data3'].values
    Time = []
    Data1 = []
    Data2 = []
    Data3 = []

    cmpssFileName = stationName + "_" + fileName.split(".")[0] + "cmpss.csv"
    bucket.download_file('data/' + stationName + '_DataFiles/' + cmpssFileName, cmpssFileName)

    # Import Data
    Data = pd.read_csv(cmpssFileName, names=['T', 'A1', 'A2', 'A3'])
    Time = Data['T'].values
    Data1 = Data['A1'].values
    Data2 = Data['A2'].values
    Data3 = Data['A3'].values

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
    Data1 = numpy.asarray(Data1)
    Data2 = numpy.asarray(Data2)
    Data3 = numpy.asarray(Data3)
    '''

    # Data1cm = Data1/10
    # Data2cm = Data2/10
    # Data3cm = Data3/10
    # calculate parameters for 4th order high pass butterworth filter and apply to data
    delt = 0.004
    wn = 0.1 * 2 * delt
    b, a = scipy.signal.butter(4, wn, 'high')
    A1 = scipy.signal.lfilter(b, a, Data1)
    A2 = scipy.signal.lfilter(b, a, Data2)
    A3 = scipy.signal.lfilter(b, a, Data3)
    # stack accelerations column-wise into an array
    A = numpy.stack((A1, A2, A3), axis=-1)
    m = A.shape[0]
    # TimeGMT=datetime.datetime.utcfromtimestamp(Time)
    # .strftime('%Y-%m-%d %H:%M:%S')
    # stack time and accelerations into an array
    # At=np.stack((Time,A1,A2,A3), axis=-1)
    # convert array to dataframe
    # P=pd.DataFrame(At)
    # print the corrected data to csv files
    # P.to_csv("1126_32Fmmpss.csv", index=False, header=False)
    # convert array to dataframe
    # P=pd.DataFrame(Amg)
    # print the corrected data to csv files
    # P.to_csv("0804_00_39mgF.csv", index=False, header=False)
    # plot the accelerations versus time
    # calculate PGA and print
    # Ah1=(A1+10000)
    # Ah2=(A2+10000)
    # Ahb= np.sqrt(Ah1*Ah2)
    # Ah=Ahb-10000
    # At=np.stack((Time,Data1cm,Data2cm,Data3cm), axis=-1)
    # Aht=pd.DataFrame(At)
    # Aht.to_csv("1130_02_3cmpss.csv", index=False, header=False)
    # PGA=max(np.sqrt(np.sum(np.power(A,2), axis=-1)))
    # PGAhax=max(Ah)
    # PGAhin=min(Ah)
    PGA1 = max(Data1)
    PGA2 = max(Data2)
    PGA1min = min(Data1)
    PGA2min = min(Data2)
    PGAvax = max(Data3)
    PGAvin = min(Data3)
    # PGAn1=max(Data1cm)
    # PGAn2=max(Data2cm)
    # PGA1nmin=min(Data1cm)
    # PGA2nmin=min(Data2cm)
    # PGAnvax=max(Data3cm)
    # PGAnvin=min(Data3cm)
    Datah = numpy.sqrt((1e7 + Data1) * (1e7 + Data2)) - 1e7
    PGAh = max(numpy.absolute(Datah))
    # find time of largest ground motion
    PGAi = numpy.argmin(Data3)
    eqTimeU = Time[PGAi]
    eqTime = datetime.datetime.utcfromtimestamp(eqTimeU).strftime('%Y-%m-%d %H:%M:%S')
    '''
    print("Event time= ", eqTime)
    print("PGAh= %f" %PGAh)
    print("PGA1= %f" %PGA1)
    print("PGA1min= %f" %PGA1min)
    print("PGA2= %f" %PGA2)
    print("PGA2min= %f" %PGA2min)
    print("PGAvax= %f" %PGAvax)
    print("PGAvin= %f" %PGAvin)
    '''
    # print("PGAhin= %f" %PGAhin)
    # print("PGAhax= %f" %PGAhax)
    # print("PGAn1= %f" %PGA1)
    # print("PGA1nmin= %f" %PGA1min)
    # print("PGA2nmin= %f" %PGA2min)
    # print("PGAn2= %f" %PGA2)
    # print("PGAnvax= %f" %PGAvax)
    # print("PGAnvin= %f" %PGAvin)
    # print("PGA1= %f" %PGA1)
    # integrate accelerations to velocities
    a2 = [1, -1]
    b2 = [0.5 * delt, 0.5 * delt]
    V1 = scipy.signal.lfilter(b2, a2, A1)
    V2 = scipy.signal.lfilter(b2, a2, A2)
    V3 = scipy.signal.lfilter(b2, a2, A3)
    # stack velocities column-wise into an array
    V = numpy.stack((V1, V2, V3), axis=-1)
    # calculate PGV and print
    PGV = max(numpy.sqrt(numpy.sum(numpy.power(V, 2), axis=-1)))
    # print("PGV= %f" % PGV)
    PGV1 = max(V1)
    PGV2 = max(V2)
    PGV1min = min(V1)
    PGV2min = min(V2)
    PGVvax = max(V3)
    PGVvin = min(V3)
    '''
    print("PGV1min= %f" %PGV1min)
    print("PGV1= %f" %PGV1)
    print("PGV2min= %f" %PGV2min)
    print("PGV2= %f" %PGV2)
    print("PGVvax= %f" %PGVvax)
    print("PGVvin= %f" %PGVvin)
    '''
    # filter velocities same as accelerations
    Vf1 = scipy.signal.lfilter(b, a, V1)
    Vf2 = scipy.signal.lfilter(b, a, V2)
    Vf3 = scipy.signal.lfilter(b, a, V3)
    # integrate velocities to displacments
    D1 = scipy.signal.lfilter(b2, a2, Vf1)
    D2 = scipy.signal.lfilter(b2, a2, Vf2)
    D3 = scipy.signal.lfilter(b2, a2, Vf3)
    # stack displacements column-wise into an array
    D = numpy.stack((D1, D2, D3), axis=-1)
    # calculate PGD and print
    PGD = max(numpy.sqrt(numpy.sum(numpy.power(D, 2), axis=-1)))
    # print("PGD= %f" % PGD)
    # calculate si
    ksi = 0.2
    # function for calculating coefficients for different periods, T
    m = len(A1)
    Initials = numpy.zeros(m)
    # function for calculating velocities of SDOF system for different periods, T
    # get calculated velocities for horizontal components with periods 1.5 and 2.5
    h1N = SDOF_pieceWise(Data1, delt, ksi, m, 1.5, Initials)
    h2N = SDOF_pieceWise(Data1, delt, ksi, m, 2.5, Initials)
    h1E = SDOF_pieceWise(Data2, delt, ksi, m, 1.5, Initials)
    h2E = SDOF_pieceWise(Data2, delt, ksi, m, 2.5, Initials)
    # max vel for T=1.5 and 2.5
    H1 = max(numpy.sqrt(numpy.power(h1N, 2) + numpy.power(h1E, 2)))
    H2 = max(numpy.sqrt(numpy.power(h2N, 2) + numpy.power(h2E, 2)))
    # calculate SI and print
    SI = 1.7 * max(H1, H2)
    '''
    print("SI= %f" %SI)
    print("--------------------------------------------------")
    print("PGAh= %f" %PGAh)
    print("Maximum of PGAV= %f" %max(abs(PGAvax), abs(PGAvin)))
    print("Maximum of PGA= %f" %max(abs(PGAvax), abs(PGAvin), abs(PGA1),abs(PGA1min), abs(PGA2), abs(PGA2min)))
    print("Maximum of PGV= %f" %max(abs(PGV1min), abs(PGV1), abs(PGV2min), abs(PGV2), abs(PGVvax), abs(PGVvin)))
    print("PGD= %f" %PGD)
    print("SI= %f" %SI)
    '''
    parameterFileName = stationName + '_' + fileName.split(".")[0] + '_parameters.txt'
    file = open(parameterFileName, "w")
    file.write('PGAh: ' + str(PGAh) +
               '\nPGAV: ' + str(max(abs(PGAvax), abs(PGAvin))) +
               '\nPGA: ' + str(max(abs(PGAvax), abs(PGAvin), abs(PGA1), abs(PGA1min), abs(PGA2), abs(PGA2min))) +
               '\nPGV: ' + str(max(abs(PGV1min), abs(PGV1), abs(PGV2min), abs(PGV2), abs(PGVvax), abs(PGVvin))) +
               '\nPGD: ' + str(PGD) + '\nSI: ' + str(SI))
    file.close()
    #ftp.storbinary("STOR " + parameterFileName, open(parameterFileName, "rb"), 1024)
    bucket.upload_file(parameterFileName, 'data/' + stationName + '_DataFiles/' + parameterFileName)
    os.remove(parameterFileName)
    #ftp.quit()


    return json.dumps({'PGAh': PGAh, 'PGAV': max(abs(PGAvax), abs(PGAvin)),
                       'PGA': max(abs(PGAvax), abs(PGAvin), abs(PGA1), abs(PGA1min), abs(PGA2), abs(PGA2min)),
                       'PGV': max(abs(PGV1min), abs(PGV1), abs(PGV2min), abs(PGV2), abs(PGVvax), abs(PGVvin)),
                       'PGD': PGD, 'SI': SI})


def coefficients(T, ksi, delt):
    w = 2 * math.pi / T
    wd = w * numpy.sqrt(1 - (numpy.power(ksi, 2)))
    A11 = (math.cos(wd * delt) + (ksi * w / wd) * math.sin(wd * delt)) * math.exp(w * (-ksi) * delt)
    A12 = ((1 / wd) * math.sin(wd * delt)) * math.exp(w * (-ksi) * delt)
    A21 = -(numpy.power(w, 2)) * A12
    A22 = (math.cos(wd * delt) - (ksi * w / wd) * math.sin(wd * delt)) * math.exp(w * (-ksi) * delt)
    D11 = (A11 - 1) / numpy.power(w, 2)
    D12 = (A12 - 2 * ksi * w * D11 - delt) / (numpy.power(w, 2) * delt)
    D21 = -A12
    D22 = D11 / delt
    return A11, A12, A21, A22, D11, D12, D21, D22


def SDOF_pieceWise(Ug, delt, ksi, m, T, Initials):
    A11, A12, A21, A22, D11, D12, D21, D22 = coefficients(T, ksi, delt)
    disp = numpy.array(Initials)
    vel = numpy.array(Initials)
    i = 0
    while i < m - 1:
        disp[i + 1] = A11 * disp[i] + A12 * vel[i] + D11 * Ug[i] + D12 * (Ug[i + 1] - Ug[i])
        vel[i + 1] = A21 * disp[i] + A22 * vel[i] + D21 * Ug[i] + D22 * (Ug[i + 1] - Ug[i])
        i += 1
    return vel
