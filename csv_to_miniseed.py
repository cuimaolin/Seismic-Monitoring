#!/usr/bin/env python
# globmseedfromcsveof.py
# csv files in ./csv
# mseed files written to ./mseed
# should move processed csv files to ./csv/done
# create event time file .evt which contains event time
# add plots
# handle more than one event in file

import numpy
from obspy import Trace, Stream
import io
import os
import pandas as pd

def data_to_Miniseed(stationName, fileName, bucket):


    """
    读取数据
    """
    bucket.download_file('data/' + stationName + '/' + fileName, fileName)
    # Import Data
    Data = pd.read_csv(fileName, names=['T', 'A1', 'A2', 'A3'], dtype={'T': 'float64', 'A1': 'float64',
                                                                       'A2': 'float64', 'A3': 'float64'})
    # import station coordintes from header, convert to scalars, then make an array to add header to corrected data files and to print coor
    # convert data into individual numpy arrays
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
    '''
    """
    进行转换，并存储
    """
    time = numpy.asarray(time)
    datax = numpy.asarray(A1)
    datay = numpy.asarray(A2)
    dataz = numpy.asarray(A3)
    sps = 250
    datapoints = 2001
    starttime = time[0]
    fileNameSplit = fileName.split('.')
    mseedfilenamex = fileNameSplit[0] + "x.mseed"
    mseedfilenamey = fileNameSplit[0] + "y.mseed"
    mseedfilenamez = fileNameSplit[0] + "z.mseed"
    plotfilenamex = fileNameSplit[0] + "x.png"
    plotfilenamey = fileNameSplit[0] + "y.png"
    plotfilenamez = fileNameSplit[0] + "z.png"

    statsx = {'network': 'BC', 'station': stationName, 'location': '00', 'channel': 'BHE', 'npts': datapoints,
              'sampling_rate': sps, 'mseed': {'dataquality': 'D'}, 'starttime': starttime}
    statsy = {'network': 'BC', 'station': stationName, 'location': '00', 'channel': 'BHN', 'npts': datapoints,
              'sampling_rate': sps, 'mseed': {'dataquality': 'D'}, 'starttime': starttime}
    statsz = {'network': 'BC', 'station': stationName, 'location': '00', 'channel': 'BHZ', 'npts': datapoints,
              'sampling_rate': sps, 'mseed': {'dataquality': 'D'}, 'starttime': starttime}

    streamx = Stream([Trace(data=datax, header=statsx)])
    streamy = Stream([Trace(data=datay, header=statsy)])
    streamz = Stream([Trace(data=dataz, header=statsz)])
    encoding = str(streamx[0].data.dtype).upper()
    print(encoding)
    streamx.write(mseedfilenamex, format='MSEED', encoding=encoding, reclen=512)
    streamy.write(mseedfilenamey, format='MSEED', encoding=encoding, reclen=512)
    streamz.write(mseedfilenamez, format='MSEED', encoding=encoding, reclen=512)
    
    streamx.plot(outfile=plotfilenamex)
    streamy.plot(outfile=plotfilenamey)
    streamz.plot(outfile=plotfilenamez)
    '''
    ftp.cwd('../' + stationName + '_DataFiles')
    ftp.storbinary("STOR " + mseedfilenamex, open(mseedfilenamex, "rb"), 1024)
    ftp.storbinary("STOR " + mseedfilenamey, open(mseedfilenamex, "rb"), 1024)
    ftp.storbinary("STOR " + mseedfilenamez, open(mseedfilenamex, "rb"), 1024)
    ftp.storbinary("STOR " + plotfilenamex, open(plotfilenamex, "rb"), 1024)
    ftp.storbinary("STOR " + plotfilenamey, open(plotfilenamex, "rb"), 1024)
    ftp.storbinary("STOR " + plotfilenamez, open(plotfilenamex, "rb"), 1024)
    ftp.quit()
    '''

    bucket.upload_file(mseedfilenamex, 'data/' + stationName + '_DataFiles/' + mseedfilenamex)
    bucket.upload_file(mseedfilenamey, 'data/' + stationName + '_DataFiles/' + mseedfilenamey)
    bucket.upload_file(mseedfilenamez, 'data/' + stationName + '_DataFiles/' + mseedfilenamez)
    bucket.upload_file(plotfilenamex, 'data/' + stationName + '_DataFiles/' + plotfilenamex)
    bucket.upload_file(plotfilenamey, 'data/' + stationName + '_DataFiles/' + plotfilenamey)
    bucket.upload_file(plotfilenamez, 'data/' + stationName + '_DataFiles/' + plotfilenamez)

    os.remove(mseedfilenamex)  
    os.remove(mseedfilenamey)
    os.remove(mseedfilenamez)
    os.remove(plotfilenamex)
    os.remove(plotfilenamey)
    os.remove(plotfilenamez)


