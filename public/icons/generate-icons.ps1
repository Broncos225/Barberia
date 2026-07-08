Add-Type -AssemblyName System.Drawing

function New-WalletIcon {
    param(
        [int]$Size,
        [string]$OutPath
    )
    $bmp = New-Object System.Drawing.Bitmap $Size, $Size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    # Background: rounded rectangle with gradient
    $rect = New-Object System.Drawing.Rectangle 0, 0, $Size, $Size
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $rect,
        [System.Drawing.Color]::FromArgb(255, 14, 165, 233),
        [System.Drawing.Color]::FromArgb(255, 3, 105, 161),
        45.0
    )
    $radius = [int]($Size * 0.1875)
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddArc(0, 0, $radius, $radius, 180, 90)
    $path.AddArc($Size - $radius, 0, $radius, $radius, 270, 90)
    $path.AddArc($Size - $radius, $Size - $radius, $radius, $radius, 0, 90)
    $path.AddArc(0, $Size - $radius, $radius, $radius, 90, 90)
    $path.CloseFigure()
    $g.FillPath($brush, $path)
    $brush.Dispose()
    $path.Dispose()

    # Wallet body
    $whitePen = New-Object System.Drawing.Pen ([System.Drawing.Color]::White), ($Size * 0.075)
    $whitePen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
    $whitePen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $whitePen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round

    $scale = $Size / 24.0
    $stroke = $Size * 0.085
    $whitePen.Width = $stroke

    # Outer wallet
    $w = $Size * 0.65
    $h = $Size * 0.45
    $x = ($Size - $w) / 2
    $y = ($Size - $h) / 2 + ($Size * 0.02)
    $g.DrawRectangle($whitePen, $x, $y, $w, $h)

    # Top horizontal line
    $g.DrawLine($whitePen, $x, $y + $h * 0.30, $x + $w, $y + $h * 0.30)

    # Coin/button circle on the right
    $coinSize = $Size * 0.075
    $cx = $x + $w * 0.78
    $cy = $y + $h * 0.62
    $coinBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
    $g.FillEllipse($coinBrush, $cx - $coinSize, $cy - $coinSize, $coinSize * 2, $coinSize * 2)
    $coinBrush.Dispose()

    $whitePen.Dispose()
    $g.Dispose()

    $bmp.Save($OutPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Generated: $OutPath"
}

New-WalletIcon -Size 192 -OutPath "$PSScriptRoot\icon-192.png"
New-WalletIcon -Size 512 -OutPath "$PSScriptRoot\icon-512.png"
New-WalletIcon -Size 512 -OutPath "$PSScriptRoot\maskable-512.png"

# Apple touch icon (180x180)
New-WalletIcon -Size 180 -OutPath "$PSScriptRoot\apple-touch-icon.png"
