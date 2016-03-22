# keep-koding-alive-crx
keep Koding VM always on by chrome extension 

##What
This project provides chrome extension to keep free-Koding-VM always on.  

> Koding.com is an online IDE for coding. Every free account owns a t2.micro EC2 instance.  
> It also provides a fully accessible Ubuntu terminal. In theory, we can do anything on it.  
> **But instance of free account will be shutdown after 1 hour if online IDE is not active.**

Supports:
* keep instance of free account always on

##How
#####1. install Koding-Robot.crx to chrome  
#####2. input 2 accounts of koding.com
```
we need 2 accounts, one is for day time, the other one is for night time.
if we keep one free vm always on for a long time, the account will be prohibited.
```
#####3. click Start button
#####4. Enjoy

##Remarks
You still need to keep the chrome browser opened.
By default, this project uses 2 accounts to keep instance always on from **0:00 to 14:00** and **14:00 to 0:00** (UTC).  
<font size='5'>
**Please make this period as shorter as possible!  
So we can save resources for good!**
</font>  
