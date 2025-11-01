package br.com.radarmottu.model;

import com.google.gson.annotations.SerializedName;

public class Vehicle {

    @SerializedName("placa")
    private String placa;

    @SerializedName("renavam")
    private String renavam;

    @SerializedName("chassi")
    private String chassi;

    @SerializedName("fabricante")
    private String fabricante;

    @SerializedName("modelo")
    private String modelo;

    @SerializedName("motor")
    private String motor;

    @SerializedName("ano")
    private int ano;

    @SerializedName("combustivel")
    private String combustivel;

    @SerializedName("clienteCpf")
    private String clienteCpf;

    @SerializedName("boxNome")
    private String boxNome;

    @SerializedName("patioNome")
    private String patioNome;

    @SerializedName("zonaNome")
    private String zonaNome;

    @SerializedName("tagBleId")
    private String tagBleId;
    
    @SerializedName("status")
    private String status;

    // Getters and Setters

    public String getPlaca() { return placa; }
    public void setPlaca(String placa) { this.placa = placa; }

    public String getRenavam() { return renavam; }
    public void setRenavam(String renavam) { this.renavam = renavam; }

    public String getChassi() { return chassi; }
    public void setChassi(String chassi) { this.chassi = chassi; }

    public String getFabricante() { return fabricante; }
    public void setFabricante(String fabricante) { this.fabricante = fabricante; }

    public String getModelo() { return modelo; }
    public void setModelo(String modelo) { this.modelo = modelo; }

    public String getMotor() { return motor; }
    public void setMotor(String motor) { this.motor = motor; }

    public int getAno() { return ano; }
    public void setAno(int ano) { this.ano = ano; }

    public String getCombustivel() { return combustivel; }
    public void setCombustivel(String combustivel) { this.combustivel = combustivel; }

    public String getClienteCpf() { return clienteCpf; }
    public void setClienteCpf(String clienteCpf) { this.clienteCpf = clienteCpf; }

    public String getBoxNome() { return boxNome; }
    public void setBoxNome(String boxNome) { this.boxNome = boxNome; }

    public String getPatioNome() { return patioNome; }
    public void setPatioNome(String patioNome) { this.patioNome = patioNome; }

    public String getZonaNome() { return zonaNome; }
    public void setZonaNome(String zonaNome) { this.zonaNome = zonaNome; }

    public String getTagBleId() { return tagBleId; }
    public void setTagBleId(String tagBleId) { this.tagBleId = tagBleId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
