[CmdletBinding()]
param([string]$Keyword = '')
$ErrorActionPreference = 'Stop'
try {
    $credentials = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'credentials.local.json') -Raw -Encoding UTF8 | ConvertFrom-Json
    $request = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'request.json') -Raw -Encoding UTF8 | ConvertFrom-Json
} catch { throw 'Check credentials.local.json and request.json JSON format.' }
$key = ([string]$credentials.serviceKey).Trim()
if (-not $key) { throw 'Enter serviceKey in credentials.local.json.' }
if ($key -match '%[0-9a-fA-F]{2}') { $key = [Uri]::UnescapeDataString($key) }
$base = 'https://apis.data.go.kr/AAAAAAA/GetSearchDataList/v2'
$path = ([string]$request.operation).Trim('/')
if ($path -match '[?#:]|\.\.') { throw 'operation must be a relative API operation path.' }
$url = $base
if ($path) { $url += '/' + $path }
$query = @('serviceKey=' + [Uri]::EscapeDataString($key))
if ($PSBoundParameters.ContainsKey('Keyword')) { $request.parameters | Add-Member -NotePropertyName keyword -NotePropertyValue $Keyword -Force }
foreach ($p in $request.parameters.PSObject.Properties) {
    if ($p.Name -ieq 'serviceKey') { throw 'Put serviceKey only in credentials.local.json.' }
    $query += [Uri]::EscapeDataString($p.Name) + '=' + [Uri]::EscapeDataString([string]$p.Value)
}
$url += '?' + ($query -join '&')
[Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
$status = 200
try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri $url -Headers @{Accept='application/json'} -TimeoutSec 30
    $body = [string]$response.Content
} catch {
    $status = 'network'
    if ($_.Exception.Response) { $status = [string][int]$_.Exception.Response.StatusCode }
    $body = [string]$_.ErrorDetails.Message
}
# Known errors only; never expose the request URL or an arbitrary error body.
if ($body -match 'NO_OPENAPI_SERVICE_ERROR') {
    throw 'Provider code 12: service/operation not found. Confirm the operation path in the portal and set request.json operation. The supplied base URL alone did not work.'
}
if ($status -ne 200) {
    throw ('API request failed (HTTP ' + $status + '). Check operation path, required parameters and service approval. Credentials are hidden.')
}
$body = $body.Replace($key,'[REDACTED]').Replace([Uri]::EscapeDataString($key),'[REDACTED]')
try { $result = $body | ConvertFrom-Json } catch {
    if ($body -match 'SERVICE_KEY|ACCESS_DENIED|AUTH') { throw 'Provider returned an authentication error. Check the approved service and key.' }
    throw 'Response is not JSON. Confirm response format and required parameters in request.json. No raw response was printed.'
}
if ($null -ne $result.response.header.resultCode -and [string]$result.response.header.resultCode -notin @('00','0')) {
    throw 'Provider returned an application error. Check required parameters and response specification.'
}
if ($null -eq $result.result -or $null -eq $result.result.data) { throw 'Unexpected JSON response: result.data is missing. Check provider response specification.' }
[ordered]@{
    endpoint = $base
    operation = $path
    totalCount = $result.result.sum
    currentCount = $result.result.dataCount
    fields = @($result.result.data | ForEach-Object { $_.PSObject.Properties.Name } | Sort-Object -Unique)
    response = $result
} | ConvertTo-Json -Depth 80