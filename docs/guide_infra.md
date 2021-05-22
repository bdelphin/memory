# Ébauche : documentation / tuto load balancer & cluster Docker Swarm

Ce document a pour objectif de donner la marche à suivre pour reproduire l'hébergement mis en place sur ce projet.

## AWS EC2

Créer 4 VMs AWS EC2 Debian10.

Ports à ouvrir dans le groupe de sécu :
- TCP port 2377 for cluster management communications
- TCP and UDP port 7946 for communication among nodes
- UDP port 4789 for overlay network traffic
- HTTP : 80 TCP
- HTTPS : 443 TCP
- Portainer : 9000 TCP
(certains ne sont peut-être pas utiles - vu que les VMs sont sur le même VPC il n'y a peut-être pas de pare-feu ? à tester)

## Docker Swarm :

Sur 3 des 4 VMs, installer docker avec les commandes suivantes :
```
sudo apt-get update

sudo apt-get install \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo \
  "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
  
sudo apt-get update
  
sudo apt-get install docker-ce docker-ce-cli containerd.io

sudo usermod -aG docker admin

exit 
```

La dernière commande déconnecte l'user (nécessaire vu qu'on vient de l'ajouter au groupe docker), il faut se reconnecter.

Sur une VM, qui sera le manager Docker Swarm, lancer la commande : 
```
docker swarm init --advertise-addr <MANAGER-IP>
```

Récupérer la commande qui s'affiche et la lancer sur les 2 VMs Docker restantes pour créer les worker (et les ajouter au swarm au passage).

Lancer sur le manager les commandes suivantes pour vérifier que le Swarm est monté :
```
docker info
docker node ls
```

## Portainer :

Déployer Portainer sur le Swarm avec : 
```
curl -L https://downloads.portainer.io/portainer-agent-stack.yml -o portainer-agent-stack.yml

docker stack deploy -c portainer-agent-stack.yml portainer
```

Se connecter sur l'URL du manager sur le port 9000.<br/>
Choisir un MDP pour portainer.

## HAproxy :

Se connecter sur la dernière VM et lancer :
```
sudo apt-get update
sudo apt-get install haproxy
```
Ajouter les lignes ci-dessous à la fin du fichier /etc/haproxy/haproxy.cfg :<br/>
(remplacer les 3 IPs à la fin par les IPs des VMs)

```
# Configure HAProxy to listen on port 80
frontend http_front
   bind *:80
   stats uri /haproxy?stats
   default_backend http_back

# Configure HAProxy to route requests to swarm nodes on port 8080
backend http_back
   balance roundrobin
   server node1 172.31.20.224:80 check
   server node2 172.31.28.181:80 check
   server node3 172.31.21.87:80 check
```

## démarrer HAProxy :
```
sudo systemctl start haproxy

sudo systemctl status haproxy
```

## letsencrypt HAProxy :

Installez certbot :
```
sudo apt-get update
sudo apt-get install certbot
```

Stoppez HAproxy et lancez Certbot en mode standalone avec les commandes suivantes.
Répondez aux différentes questions posées par Certbot.
```
sudo systemctl stop haproxy
sudo certbot certonly --standalone
```

HAproxy nécessite un certificat en un seul fichier, il faut donc qu'on combine privkey.pem et fullchain.pem :
```
sudo su
cd /etc/letsencrypt/live/example.com/
cat fullchain.pem privkey.pem > example.com.pem
mkdir -p /etc/haproxy/certs
cp example.com.pem /etc/haproxy/certs/
```

Faites un backup de la config d'HAproxy au cas où :
```
cp /etc/haproxy/haproxy.cfg /etc/haproxy/haproxy.cfg.bak
```

Modifiez la config d'HAproxy :
```
global
	log /dev/log	local0
	log /dev/log	local1 notice
	chroot /var/lib/haproxy
	stats socket /run/haproxy/admin.sock mode 660 level admin expose-fd listeners
	stats timeout 30s
	user haproxy
	group haproxy
	daemon

defaults
	log	global
	mode	http
	option	httplog
	option	dontlognull
        timeout connect 5000
        timeout client  50000
        timeout server  50000
	errorfile 400 /etc/haproxy/errors/400.http
	errorfile 403 /etc/haproxy/errors/403.http
	errorfile 408 /etc/haproxy/errors/408.http
	errorfile 500 /etc/haproxy/errors/500.http
	errorfile 502 /etc/haproxy/errors/502.http
	errorfile 503 /etc/haproxy/errors/503.http
	errorfile 504 /etc/haproxy/errors/504.http

# Configure HAProxy to listen on port 80
frontend http_front
   bind *:80   
   stats uri /haproxy?stats
   default_backend http_back

frontend https_front
   bind *:443 ssl crt /etc/haproxy/certs/example.com.pem
   reqadd X-Forwarded-Proto:\ https
   http-request set-header X-SSL %[ssl_fc]
   default_backend http_back

# Configure HAProxy to route requests to swarm nodes on port 80
backend http_back
   redirect scheme https code 301 if !{ ssl_fc }
   balance roundrobin
   server node1 172.31.20.224:80 check  
   server node2 172.31.28.181:80 check
   server node3 172.31.21.87:80 check
```

Pensez à modifier les IPs des nodes Docker Swarm (3 dernières lignes).

Relancez HAproxy :
```
sudo systemctl start haproxy
```

En cas d'erreur, cherchez plus d'infos dans les logs HAproxy `/var/log/haproxy.log`.



# Liens utiles / sources :

https://docs.docker.com/engine/swarm/swarm-tutorial/ <br/>
https://docs.docker.com/engine/swarm/swarm-tutorial/create-swarm/ <br/>
https://documentation.portainer.io/v2.0/deploy/ceinstallswarm/ <br/>
https://docs.docker.com/engine/install/debian/ <br/>
https://docs.docker.com/engine/swarm/ingress/#configure-an-external-load-balancer<br/>
https://certbot.eff.org/lets-encrypt/debianbuster-haproxy<br/>
https://skarlso.github.io/2017/02/15/how-to-https-with-hugo-letsencrypt-haproxy/
