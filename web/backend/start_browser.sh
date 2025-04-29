#!/bin/bash

flatpak run org.gnome.Epiphany --new-window 'http://localhost:3000'

sleep 5

xdotool search --onlyvisible --class Epiphany windowactivate key F11