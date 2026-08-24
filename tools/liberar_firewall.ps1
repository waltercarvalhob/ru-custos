# Libera as portas do RU-CUSTOS no Firewall do Windows para acesso pela rede local (Wi-Fi/escritorio).
# Rode este arquivo como Administrador: botao direito -> "Executar com PowerShell" (via um PowerShell aberto como Admin),
# ou: clique direito no menu Iniciar -> "Windows PowerShell (Admin)" -> cole o comando abaixo.
#
# ATENCAO: inclui o perfil Publico porque a rede Wi-Fi usada (ex: rede institucional) esta
# classificada assim pelo Windows. Isso significa que qualquer dispositivo na mesma rede
# Wi-Fi/publica consegue tentar acessar o sistema nessas portas, nao so maquinas de confianca.

New-NetFirewallRule -DisplayName "RU-CUSTOS Frontend (4200)" -Direction Inbound -Protocol TCP -LocalPort 4200 -Action Allow -Profile Domain,Private,Public
New-NetFirewallRule -DisplayName "RU-CUSTOS Gateway (8080)" -Direction Inbound -Protocol TCP -LocalPort 8080 -Action Allow -Profile Domain,Private,Public

Write-Host "Portas 4200 e 8080 liberadas (perfis Domain/Private/Publico)."
