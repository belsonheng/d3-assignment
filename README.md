# d3-assignment

Live Demo: https://belsonheng.github.io/d3-assignment/

## Background
A team has performed several experiments to test the efficiency of video streaming methods. For better validation of results, tests are conducted using 4 network conditions/profiles with 7 video samples under 3 buffer capacity configurations.

* In the first configuration, the total duration of video that can be stored in the buffer is either 30 seconds or 60 seconds based on the duration of the video. If the video is more than 10 minutes, the buffer capacity is 60 seconds. Otherwise, it is 30 seconds. 

* In the other two configurations (i.e. 120 seconds and 240 seconds), the buffer capacity is fixed and not dependent on video duration.

* Video sample V1, V4, and V5 are less than 10 minutes and remaining (V2, V3, V6, and V7) are more than 10 minutes. The results are stored in result.csv file residing in the data folder.

## Data Attributes
The result.csv file has following attributes:

Field | Description
------------ | -------------
profile | Network profile used for testing.
sample | Video sample on which test is conducted.
method | Method used for streaming.
quality | Average quality played (in Kbps).
change | Changes in quality during the playback.
inefficiency | Inefficiency of the method to fully utilize the available bandwidth.
stall | Total stall duration (in seconds) during the playback.
numStall | Number of stalls happened during the playback.
avgStall | Average stall duration (in seconds) during the playback.
overflow | The duration (in seconds) for which buffer was full.
numOverflow | Number of times when buffer was full.
qoe | Quality of experience during the playback.
bufSize | Buffer configuration, i.e., the maximum content that can be buffered/ buffer capacity (in seconds).
