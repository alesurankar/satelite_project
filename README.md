## remove build
```bash
Remove-Item -Recurse -Force build
```

## 1. cmake
```bash
cmake -S . -B build -G "MinGW Makefiles"
```
## 2. build
```bash
cmake --build build
```
## 3. run
```bash
.\build\satellite_sim.exe
```