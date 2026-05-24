$file = "app\report\page.tsx"
$lines = Get-Content $file
$newLines = $lines | Where-Object { $_ -notmatch "as const|Record<|CheckStatus|: string\b|: number\b|: boolean\b|: Set<|: Lang\b|useState<" }
$newLines | Set-Content $file