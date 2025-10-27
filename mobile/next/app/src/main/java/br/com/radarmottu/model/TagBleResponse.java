package br.com.radarmottu.model;

import com.google.gson.annotations.SerializedName;

public class TagBleResponse {
    @SerializedName("tag")
    private String tag;

    public String getTag() {
        return tag;
    }
}
