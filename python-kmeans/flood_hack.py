import requests
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

# R to py suff
from rpy2 import robjects
from rpy2.robjects import pandas2ri
from rpy2.robjects.packages import importr

base = importr('base')
stats = importr('stats')

min_lat = 40.0
max_lat = 60.0

min_long = 352.0
max_long = 360.0

step = 0.5

def porcherie(url_to_process):
  # fetch the data
  r = requests.get(url_to_process)
  # clean the data
  r.raise_for_status()
  data = np.array(eval(r.text.replace('{', '[').replace('}', ']')))
  print(data.shape)
  # build the data structure
  final = []
  for col in range(data.shape[0]):
    for row in range(data.shape[1]):
      final.append([(np.arange(max_lat, min_lat - 0.5, -step)[row], np.arange(min_long, max_long + 0.5, step)[col]), data[col][row]])
  matrix = np.array(final)
  # sort and return the data structure
  sorted_matrix = sorted(matrix, key=lambda x : x[0][0])
  return sorted_matrix

# --------- TP -----------
url_fmt_tp = 'http://incubator.ecmwf.int/2e/rasdaman/ows?service=WCS&version=2.0.1&request=ProcessCoverages&query=for c in (%s) return encode(c[Lat(%f:%f), Long(%f:%f), ansi("%s" : "%s")], "csv") '
url_tp = url_fmt_tp % ("TP", min_lat, max_lat, min_long, max_long, "2014-12-20T00:00:00+00:00", "2014-12-30T00:00:00+00:00")
print(url_tp)
tp_data = porcherie(url_tp)
print(tp_data)

# --------- T2m -----------
url_fmt_t2m = 'http://incubator.ecmwf.int/2e/rasdaman/ows?service=WCS&version=2.0.1&request=ProcessCoverages&query=for c in (%s) return encode(c[Lat(%f:%f), Long(%f:%f), ansi("%s" : "%s")] - 273.15, "csv") '
url_t2m = url_fmt_t2m % ("T2m", min_lat, max_lat, min_long, max_long, "2014-12-20T00:00:00+00:00", "2014-12-30T00:00:00+00:00")
print(url_t2m)
t2m_data = porcherie(url_t2m)
print(t2m_data)

#matrix_check = np.array(stuff)

# ----- SAVE TO FILE
# f = open('la_robbba.txt', 'w')
# for t in sorted_matrix:
#   line = ' '.join(str(x) for x in t)
#   f.write(line + '\n')
# f.close()

#np.save('la_robbba2.npy', sorted_matrix)

PERCENTILE = 90

tp_data_df = pd.DataFrame(tp_data)
t2m_data_df = pd.DataFrame(t2m_data)

lati = tp_data_df.ix[:, 0].apply(lambda x : x[0])
longi = tp_data_df.ix[:, 0].apply(lambda x : x[1])
tp_percs = tp_data_df.ix[:, 1].apply(np.percentile, args=(PERCENTILE,))
t2m_percs = t2m_data_df.ix[:, 1].apply(np.percentile, args=(PERCENTILE,))

data_frame = pd.DataFrame({'lati': lati, 'longi': longi, 'tp_percs': tp_percs, 't2m_percs': t2m_percs})
#percs = tp_data.apply(np.percentile, args=(90,))

pandas2ri.activate()
data_t2m_tp = data_frame.ix[:, [2,3]]
data_t2m_tp.ix[:,1] = data_t2m_tp.ix[:,1] * 1000 

data_lat_long = data_frame.ix[:, [0,1]]

R = robjects.r

KM = R.kmeans(data_t2m_tp, 10)

centers = np.array(KM.rx2('centers'))
clusters = np.array([np.array(KM.rx2('cluster'))]).T

complete_data = pd.concat([data_frame, pd.DataFrame(clusters, columns=['cluster_id'])], axis=1)

#stuff = pandas2ri(data_frame)
plt.scatter(x=data_t2m_tp.ix[:,0], y=data_t2m_tp.ix[:,1], c=complete_data.ix[:,4])
plt.show()
#R.points(data_lat_long, col = KM.rx2('cluster'))

plt.scatter(x=data_lat_long.ix[:,0], y=data_lat_long.ix[:,1], c=complete_data.ix[:,4])
plt.show()

