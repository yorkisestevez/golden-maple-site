 = 'css/style.css'
 = [System.IO.File]::ReadAllBytes()
if (.Length -ge 3 -and [0] -eq 0xEF -and [1] -eq 0xBB -and [2] -eq 0xBF) {
    [System.IO.File]::WriteAllBytes(, [3..(.Length - 1)])
}
