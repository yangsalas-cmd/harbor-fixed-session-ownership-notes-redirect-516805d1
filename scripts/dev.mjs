import http from 'node:http';
import worker from '../worker/index.js';
const port=Number(process.env.PORT||4173);
http.createServer(async(req,res)=>{try{const chunks=[];for await(const c of req)chunks.push(c);const init={method:req.method,headers:req.headers};if(!['GET','HEAD'].includes(req.method)){init.body=Buffer.concat(chunks);init.duplex='half'}const request=new Request('http://127.0.0.1:'+port+req.url,init);const response=await worker.fetch(request);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()))}catch{res.writeHead(500,{'content-type':'application/json'});res.end(JSON.stringify({error:'Demo request failed'}))}}).listen(port,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:'+port));
